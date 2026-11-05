import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Home,
  Package,
  ArrowLeftRight,
  History,
  User,
  ArrowRight,
  Lock,
  Eye,
  EyeOff,
  Bell,
  FlaskConical,
  AlertTriangle,
  Receipt,
  ChevronRight,
  LogOut,
  Wrench,
  Search,
  Plus,
  CheckCircle2,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
  Smartphone,
  RotateCcw,
  SlidersHorizontal,
  X,
  RotateCw,
  Truck,
  ArrowLeft,
  FileText,
  Calendar,
  Building2,
  Sun,
  Moon
} from 'lucide-react';
import type { InventoryItem } from '../data/mockInventory';

// URL Web App Apps Script KJS yang sudah ada.
const KJS_API_URL = 'https://script.google.com/macros/s/AKfycbw3lXRWrfVcvdNwQhfUOtUkaPY-62z3oq9Ykhfxvm5VsqfGsbny8WH4rkpz8Oj-535x/exec';
const KJS_TOKEN_KEY = 'kjs_inventory_token';

interface DashboardSummary {
  bahanAktif?: number | string;
  activeMaterials?: number | string;
  totalBahan?: number | string;
  rawMaterials?: number | string;

  produkAktif?: number | string;
  activeProducts?: number | string;
  totalProduk?: number | string;
  finishedProducts?: number | string;

  supplierAktif?: number | string;
  activeSuppliers?: number | string;
  totalSupplier?: number | string;
  suppliers?: number | string;

  totalProduksi?: number | string;
  [key: string]: unknown;
}

interface RecentProductionItem {
  id?: string;
  nama?: string;
  namaProduk?: string;
  produk?: string;
  productName?: string;
  itemName?: string;
  noBatch?: string;
  batchNo?: string;
  batch?: string;
  kode?: string;
  jumlah?: number | string;
  qty?: number | string;
  quantity?: number | string;
  satuan?: string;
  unit?: string;
  tanggal?: string;
  date?: string;
  timestamp?: string;
  operator?: string;
  pic?: string;
  penanggungJawab?: string;
  status?: string;
  [key: string]: unknown;
}

interface DashboardApiResponse {
  success?: boolean;
  message?: string;
  summary?: DashboardSummary;
  products?: unknown[];
  recentProduction?: RecentProductionItem[];
  updatedAt?: string;
  [key: string]: unknown;
}

type LiveInventoryItem = InventoryItem & { stockError?: string };

interface MaterialOption { kode: string; nama: string; satuan: string; kategori?: string; density?: number | string; }
interface SupplierOption {
  kode: string;
  nama: string;
  kontak?: string;
  telepon?: string;
  alamat?: string;
  keterangan?: string;
  pic?: string;
  [key: string]: unknown;
}
interface StockInApiResponse { success?: boolean; message?: string; data?: { id?: string; kodeBahan?: string; namaBahan?: string; batch?: string }; }
interface BatchCoaStatus { success?: boolean; exists?: boolean; documents?: Array<{ namaFile?: string; urlFile?: string; idStokMasuk?: string }>; message?: string; }
interface ReceiptRecord { id: string; tanggal: string; kodeBahan: string; namaBahan: string; batch: string; expiredDate: string; qty: number; satuan: string; supplier: string; qc: string; petugas: string; kategori: string; }

interface InventoryApiResponse {
  success?: boolean;
  message?: string;
  items?: Array<{
    id: string;
    sku: string;
    name: string;
    category: 'Bahan Baku' | 'Bahan Kemasan' | 'Produk Jadi';
    stock: number | null;
    minStock: number;
    unit: string;
    location: string;
    lastUpdated: string;
    stockError?: string;
  }>;
  updatedAt?: string;
}

type AndroidSimulatorProps = {
  /** Render only the app screen, without simulator controls or a phone frame. */
  standalone?: boolean;
};

export default function AndroidSimulator({ standalone = false }: AndroidSimulatorProps) {
  // App state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('Pengguna KJS');
  const [role, setRole] = useState('KARYAWAN');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => localStorage.getItem('kjs_inventory_theme') === 'dark' ? 'dark' : 'light');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'Beranda' | 'Stok' | 'Transaksi' | 'Stok Keluar' | 'Catatan Penerimaan' | 'Akun' | 'Kartu Stok'>('Beranda');
  
  // Login form
  const [inputUsername, setInputUsername] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Live Dashboard API state
  const [dashboardData, setDashboardData] = useState<DashboardApiResponse | null>(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('kjs_inventory_theme', theme);
  }, [theme]);

  // Simulator Mode: 'starter' (Matches MainActivity.kt with placeholders and '—') vs 'interactive' (Live Data)
  const [mode, setMode] = useState<'starter' | 'interactive'>('interactive');
  const [showPhoneFrame, setShowPhoneFrame] = useState(!standalone);

  // Live Inventory & Transactions state
  const [inventory, setInventory] = useState<LiveInventoryItem[]>([]);
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);
  const [inventoryError, setInventoryError] = useState<string | null>(null);
  const [inventoryUpdatedAt, setInventoryUpdatedAt] = useState<string | null>(null);
  const [receiptCategory, setReceiptCategory] = useState<'BAHAN BAKU' | 'BAHAN PENGEMAS'>('BAHAN BAKU');
  const [receiptRecords, setReceiptRecords] = useState<ReceiptRecord[]>([]);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [receiptError, setReceiptError] = useState('');
  const [receiptSearch, setReceiptSearch] = useState('');
  const [receiptDateFrom, setReceiptDateFrom] = useState('');
  const [receiptDateTo, setReceiptDateTo] = useState('');
  const [receiptQcFilter, setReceiptQcFilter] = useState('Semua QC');
  const [receiptSupplierFilter, setReceiptSupplierFilter] = useState('Semua supplier');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'Semua' | 'Bahan Baku' | 'Bahan Kemasan' | 'Produk Jadi'>('Semua');

  // Kartu stok detail (Bahan Baku, Bahan Pengemas, Produk Jadi)
  const [stockCardCategory, setStockCardCategory] = useState<'BAHAN BAKU' | 'BAHAN PENGEMAS' | 'PRODUK JADI'>('BAHAN BAKU');
  const [stockCardCode, setStockCardCode] = useState('');
  const [stockCardData, setStockCardData] = useState<any>(null);
  const [stockCardLoading, setStockCardLoading] = useState(false);
  const [stockCardError, setStockCardError] = useState('');
  const [stockCardSearch, setStockCardSearch] = useState('');
  const [stockCardDateFrom, setStockCardDateFrom] = useState('');
  const [stockCardDateTo, setStockCardDateTo] = useState('');

  // Dashboard Sub-Views: Akses langsung data dari kartu ringkasan
  const [dashboardSubView, setDashboardSubView] = useState<'bahan' | 'produk' | 'supplier' | null>(null);
  const [dashboardMaterialCategory, setDashboardMaterialCategory] = useState<'BAHAN BAKU' | 'BAHAN PENGEMAS'>('BAHAN BAKU');
  const [trxMaterialCategory, setTrxMaterialCategory] = useState<'BAHAN BAKU' | 'BAHAN PENGEMAS'>('BAHAN BAKU');
  const [dashboardSubSearch, setDashboardSubSearch] = useState('');
  const [selectedDashboardItemHistory, setSelectedDashboardItemHistory] = useState<{ item: any; category: 'BAHAN BAKU' | 'BAHAN PENGEMAS' | 'PRODUK JADI' } | null>(null);
  const [selectedSupplierDetail, setSelectedSupplierDetail] = useState<SupplierOption | null>(null);


  // Transaction form modal
  const [trxType, setTrxType] = useState<'MASUK' | 'KELUAR'>('MASUK');
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [trxQty, setTrxQty] = useState<number>(10);
  // Nilai pembelian diperlukan backend untuk mencatat NILAI_STOK_MASUK.
  const [trxHargaPembelian, setTrxHargaPembelian] = useState<number>(0);
  const [trxOngkosKirim, setTrxOngkosKirim] = useState<number>(0);
  const [trxPic, setTrxPic] = useState<string>('');
  const [trxNotes, setTrxNotes] = useState<string>('');
  const [trxSuccessMessage, setTrxSuccessMessage] = useState<string | null>(null);
  const [isSavingTransaction, setIsSavingTransaction] = useState(false);
  const [trxResultModal, setTrxResultModal] = useState<{ type: 'success' | 'error'; title: string; message: string } | null>(null);
  const [materials, setMaterials] = useState<MaterialOption[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);
  const [isLoadingFormData, setIsLoadingFormData] = useState(false);
  const [trxDate, setTrxDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [trxBatch, setTrxBatch] = useState('');
  const [trxExpiry, setTrxExpiry] = useState('');
  const [trxSupplier, setTrxSupplier] = useState('');
  const [trxQc, setTrxQc] = useState('LOLOS');
  const [coaFile, setCoaFile] = useState<File | null>(null);
  const [coaStatus, setCoaStatus] = useState<string>('');
  const [coaExists, setCoaExists] = useState(false);
  const [savedStockInId, setSavedStockInId] = useState('');

  // Stok keluar produk jadi (mengikuti modal web KJS).
  const [productOutDate, setProductOutDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [productOutProductId, setProductOutProductId] = useState('');
  const [productOutBatches, setProductOutBatches] = useState<Array<{ batch: string; stok: number; satuan?: string }>>([]);
  const [productOutBatch, setProductOutBatch] = useState('');
  const [productOutTotalStock, setProductOutTotalStock] = useState<number | null>(null);
  const [productOutQty, setProductOutQty] = useState('');
  const [productOutTujuan, setProductOutTujuan] = useState('Reseller JP');
  const [productOutNotes, setProductOutNotes] = useState('');
  const [productOutLoading, setProductOutLoading] = useState(false);
  const [productOutSaving, setProductOutSaving] = useState(false);
  const [productOutError, setProductOutError] = useState('');
  const [productOutNotice, setProductOutNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Detail/edit transaksi stok masuk yang dibuka dari riwayat Kartu Stok.
  const [stockInDetailOpen, setStockInDetailOpen] = useState(false);
  const [stockInDetailLoading, setStockInDetailLoading] = useState(false);
  const [stockInDetailSaving, setStockInDetailSaving] = useState(false);
  const [stockInDetail, setStockInDetail] = useState<any>(null);
  const [stockInEdit, setStockInEdit] = useState<any>(null);
  const [stockInDocuments, setStockInDocuments] = useState<any[]>([]);
  const [stockInCoaFile, setStockInCoaFile] = useState<File | null>(null);
  const [stockInDetailNotice, setStockInDetailNotice] = useState<{type:'success'|'error'; message:string} | null>(null);
  const [closeStockInDetailAfterNotice, setCloseStockInDetailAfterNotice] = useState(false);

  // Memanggil API action "dashboard" menggunakan token sesi dari Apps Script
  const fetchDashboardData = async (forcedToken?: string) => {
    const token = forcedToken || localStorage.getItem(KJS_TOKEN_KEY);
    if (!token) {
      setDashboardError('Sesi tidak ditemukan. Silakan login kembali.');
      return;
    }

    setIsLoadingDashboard(true);
    setDashboardError(null);

    try {
      const response = await fetch(KJS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'dashboard', token }),
      });

      if (!response.ok) {
        throw new Error('Server Apps Script merespons HTTP ' + response.status + '.');
      }

      const result: DashboardApiResponse = await response.json();

      if (result && result.success === false) {
        // Tangani sesi yang kedaluwarsa atau token tidak valid
        if (/token|sesi|expired|kedaluwarsa|unauthorized|invalid/i.test(result.message || '')) {
          localStorage.removeItem(KJS_TOKEN_KEY);
          setIsLoggedIn(false);
          setLoginError('Sesi Anda telah kedaluwarsa. Silakan masuk kembali.');
          throw new Error('Sesi Anda telah kedaluwarsa. Silakan login kembali.');
        }
        throw new Error(result.message || 'Gagal memuat data dashboard dari server.');
      }

      // Perbarui state dashboard dengan respons terbaru dari server
      setDashboardData(result);
      setDashboardError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Terjadi kesalahan saat memuat dashboard.';
      if (/failed to fetch|networkerror|load failed/i.test(message)) {
        setDashboardError('Tidak dapat terhubung ke Google Apps Script. Periksa koneksi internet atau deployment Web App.');
      } else {
        setDashboardError(message);
      }
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  const callKjsApi = async <T,>(payload: Record<string, unknown>): Promise<T> => {
    const token = localStorage.getItem(KJS_TOKEN_KEY);
    if (!token) throw new Error('Sesi tidak ditemukan. Silakan login kembali.');
    const response = await fetch(KJS_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ ...payload, token }),
    });
    if (!response.ok) throw new Error('Server Apps Script merespons HTTP ' + response.status + '.');
    const result = await response.json();
    if (result && result.success === false) throw new Error(result.message || 'Permintaan gagal.');
    return result as T;
  };

  const parseProductOutProduct = (value: string) => {
    const selected = inventory.find(item => item.id === value);
    const idParts = String(value || '').split(':');
    const code = selected?.id.startsWith('PRODUK:') ? idParts[1] : (selected?.sku || '');
    const packaging = selected?.id.startsWith('PRODUK:') ? idParts.slice(2).join(':') : '';
    return { selected, code: String(code || '').trim(), packaging: String(packaging || '').trim() };
  };

  const loadProductOutAvailability = async (productId: string) => {
    setProductOutProductId(productId);
    setProductOutBatch('');
    setProductOutQty('');
    setProductOutBatches([]);
    setProductOutTotalStock(null);
    setProductOutError('');
    setProductOutNotice(null);
    if (!productId) return;

    const { code, packaging } = parseProductOutProduct(productId);
    if (!code) {
      setProductOutError('Kode produk tidak terbaca dari data persediaan.');
      return;
    }
    setProductOutLoading(true);
    try {
      const [batchResponse, totalResponse] = await Promise.all([
        callKjsApi<any>({ action: 'availableProductBatches', kodeProduk: code, kemasan: packaging }),
        callKjsApi<any>({ action: 'currentProductStock', kodeProduk: code, kemasan: packaging }),
      ]);
      const rows = Array.isArray(batchResponse) ? batchResponse : (batchResponse?.items || batchResponse?.batches || batchResponse?.data || []);
      setProductOutBatches((Array.isArray(rows) ? rows : []).map((row: any) => ({
        batch: String(row.batch || row.Batch || row.noBatch || '').trim(),
        stok: Number(row.stok ?? row.stock ?? row.qty ?? 0),
        satuan: String(row.satuan || row.unit || 'PCS'),
      })).filter((row: { batch: string; stok: number }) => row.batch && row.stok > 0));
      const total = typeof totalResponse === 'number' ? totalResponse : Number(totalResponse?.stok ?? totalResponse?.stock ?? totalResponse?.totalStock ?? totalResponse?.data ?? 0);
      setProductOutTotalStock(Number.isFinite(total) ? total : 0);
    } catch (error) {
      setProductOutError(error instanceof Error ? error.message : 'Gagal membaca batch dan stok produk. Pastikan dispatcher AndroidApi.gs sudah diperbarui dan di-deploy.');
    } finally {
      setProductOutLoading(false);
    }
  };

  const handleSaveProductOut = async (event: React.FormEvent) => {
    event.preventDefault();
    setProductOutNotice(null);
    const { selected, code, packaging } = parseProductOutProduct(productOutProductId);
    const batchInfo = productOutBatches.find(item => item.batch === productOutBatch);
    const qty = Number(productOutQty);
    if (!code || !productOutDate || !productOutBatch || !Number.isFinite(qty) || qty <= 0) {
      setProductOutNotice({ type: 'error', message: 'Pilih produk dan batch, lalu isi tanggal serta Qty lebih dari 0.' });
      return;
    }
    if (!batchInfo) {
      setProductOutNotice({ type: 'error', message: 'Batch yang dipilih sudah tidak tersedia. Muat ulang stok lalu pilih kembali.' });
      return;
    }
    if (qty > batchInfo.stok) {
      setProductOutNotice({ type: 'error', message: `Qty melebihi stok batch. Tersedia ${batchInfo.stok.toLocaleString('id-ID')} PCS.` });
      return;
    }

    setProductOutSaving(true);
    try {
      const data = {
        tanggal: productOutDate,
        kodeProduk: code,
        kemasan: packaging,
        batch: productOutBatch,
        qty,
        tujuan: productOutTujuan.trim() || 'Reseller JP',
        keterangan: productOutNotes.trim(),
        petugas: userName,
      };
      const result = await callKjsApi<any>({ action: 'saveFinishedProductOut', data, payload: data, ...data });
      if (result?.success === false) throw new Error(result.message || 'Gagal menyimpan stok keluar.');
      const message = result?.message || `Stok keluar ${qty.toLocaleString('id-ID')} PCS untuk ${selected?.name || code} berhasil disimpan.`;
      setProductOutQty('');
      setProductOutNotes('');
      await Promise.all([loadProductOutAvailability(productOutProductId), fetchInventoryData(), fetchDashboardData()]);
      setProductOutNotice({ type: 'success', message });
    } catch (error) {
      setProductOutNotice({ type: 'error', message: error instanceof Error ? error.message : 'Gagal menyimpan stok keluar produk.' });
    } finally {
      setProductOutSaving(false);
    }
  };

  const loadStockInFormData = async () => {
    setIsLoadingFormData(true);
    try {
      const [materialResults, supplierResult, inventoryResult] = await Promise.all([
        Promise.all(['BAHAN BAKU', 'BAHAN PENGEMAS'].map(category => callKjsApi<MaterialOption[] | { items?: MaterialOption[] }>({ action: 'masterMaterials', category }))),
        callKjsApi<SupplierOption[] | { items?: SupplierOption[] }>({ action: 'masterSuppliers' }),
        callKjsApi<InventoryApiResponse>({ action: 'inventory' }),
      ]);
      const rawMaterialRows: any[] = materialResults.flatMap((result: any, index: number) => {
        const rows = Array.isArray(result) ? result : (Array.isArray(result?.items) ? result.items : []);
        return rows.map((row: any) => ({ ...row, kategori: row.kategori || row.Kategori || ['BAHAN BAKU', 'BAHAN PENGEMAS'][index] }));
      });
      const inventoryMaterials = (Array.isArray(inventoryResult?.items) ? inventoryResult.items : [])
        .filter(item => item.category === 'Bahan Baku' || item.category === 'Bahan Kemasan')
        .map(item => ({
          kode: item.sku,
          nama: item.name,
          satuan: item.unit,
          kategori: item.category === 'Bahan Kemasan' ? 'BAHAN PENGEMAS' : 'BAHAN BAKU',
          status: 'AKTIF',
        }));
      rawMaterialRows.push(...inventoryMaterials);
      const rawSupplierRows: any[] = Array.isArray(supplierResult)
        ? supplierResult
        : (Array.isArray((supplierResult as any)?.items) ? (supplierResult as any).items : []);

      const validMaterials: MaterialOption[] = [];
      for (const m of rawMaterialRows) {
        if (!m || typeof m !== 'object') continue;
        const kode = String(m.kode || m['Kode Bahan'] || m.kodeBahan || m.kd || m['kode'] || m.sku || m.id || '').trim();
        const nama = String(m.nama || m['Nama Bahan'] || m.namaBahan || m.name || kode).trim();
        const satuan = String(m.satuan || m['Satuan'] || m.unit || 'gram').trim();
        const kategori = String(m.kategori || m['Kategori'] || m.jenis || m['Jenis'] || 'BAHAN BAKU').trim();
        const status = String(m.status || m['Status'] || m.statusAktif || m['Status Aktif'] || m.aktif || m['Aktif'] || 'AKTIF').trim().toUpperCase();
        if (!kode) continue;
        // Jika ada status eksplisit, pastikan bahan berstatus aktif
        if (status && status !== 'AKTIF' && status !== 'TRUE' && status !== '1' && status !== 'YA') continue;
        validMaterials.push({ kode, nama, satuan, kategori, density: m.density });
      }

      const validSuppliers: SupplierOption[] = rawSupplierRows
        .filter((v: any) => v && typeof v === 'object')
        .map((v: any) => ({
          kode: String(v.kode || v['Kode Supplier'] || v.kodeSupplier || v.kd || '').trim(),
          nama: String(v.nama || v['Nama Supplier'] || v.namaSupplier || v.name || '').trim(),
          kontak: String(v.kontak || v['Kontak'] || v.telepon || v.phone || v.pic || '').trim(),
          telepon: String(v.telepon || v['Telepon'] || v.kontak || v.phone || '').trim(),
          alamat: String(v.alamat || v['Alamat'] || v.address || '').trim(),
          pic: String(v.pic || v['PIC'] || v.kontak || '').trim(),
          keterangan: String(v.keterangan || v['Keterangan'] || v.notes || '').trim()
        }))
        .filter(s => Boolean(s.kode));

      const uniqueMaterials = Array.from(new Map(validMaterials.map(item => [`${item.kategori}:${item.kode}`.toUpperCase(), item])).values());
      setMaterials(uniqueMaterials);
      setSuppliers(validSuppliers);

      // Sinkronkan selectedItemId dengan bahan baku aktif
      if (uniqueMaterials.length) {
        setSelectedItemId(current => {
          const exists = uniqueMaterials.some(m => m.kategori?.toUpperCase().includes(trxMaterialCategory === 'BAHAN PENGEMAS' ? 'KEMAS' : 'BAKU') && m.kode.toUpperCase() === String(current || '').trim().toUpperCase());
          return exists ? current : (uniqueMaterials.find(m => m.kategori?.toUpperCase().includes(trxMaterialCategory === 'BAHAN PENGEMAS' ? 'KEMAS' : 'BAKU'))?.kode || '');
        });
      }
      if (validSuppliers.length && !trxSupplier) {
        setTrxSupplier(validSuppliers[0].kode);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal memuat master bahan/supplier.';
      console.error('[KJS masterMaterials/masterSuppliers] Gagal:', error);
      setTrxSuccessMessage('Gagal memuat master: ' + message);
    } finally { setIsLoadingFormData(false); }
  };

  const checkBatchCoa = async (kodeBahan: string, batch: string) => {
    setCoaExists(false);
    setCoaStatus('');
    if (!kodeBahan || !batch.trim()) return;
    try {
      const result = await callKjsApi<BatchCoaStatus>({ action: 'checkBatchCOA', kodeBahan, batch: batch.trim() });
      setCoaExists(Boolean(result.exists));
      setCoaStatus(result.exists ? 'COA sudah tersedia untuk batch ini.' : 'COA belum tersedia. Kamu bisa mengunggahnya sekarang atau nanti.');
    } catch (error) {
      setCoaStatus(error instanceof Error ? 'Status COA belum dapat diperiksa: ' + error.message : 'Status COA belum dapat diperiksa.');
    }
  };

  const readFileAsBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('File COA gagal dibaca.'));
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      const comma = dataUrl.indexOf(',');
      if (comma < 0) reject(new Error('Format file COA tidak valid.'));
      else resolve(dataUrl.slice(comma + 1));
    };
    reader.readAsDataURL(file);
  });

  const uploadCoaToSavedTransaction = async () => {
    if (!savedStockInId || !coaFile) {
      setTrxSuccessMessage('Pilih file COA dan pastikan transaksi stok masuk sudah tersimpan.');
      return;
    }
    if (!['application/pdf','image/jpeg','image/png','image/webp'].includes(coaFile.type) || coaFile.size > 8 * 1024 * 1024) {
      const message = 'File COA harus PDF/JPG/PNG/WEBP dengan ukuran maksimal 8 MB.';
      setTrxSuccessMessage(message);
      setTrxResultModal({ type: 'error', title: 'File COA tidak valid', message });
      return;
    }
    setIsSavingTransaction(true);
    try {
      const base64 = await readFileAsBase64(coaFile);
      await callKjsApi({ action: 'uploadMaterialDocument', payload: {
        idStokMasuk: savedStockInId, jenisDokumen: 'COA', tanggalDokumen: trxDate,
        namaFile: coaFile.name, mimeType: coaFile.type, base64,
      }});
      setCoaExists(true);
      setCoaStatus('COA sudah tersedia untuk batch ini.');
      setCoaFile(null);
      setTrxSuccessMessage('COA berhasil diunggah ke transaksi stok masuk ' + savedStockInId + '.');
    } catch (error) {
      setTrxSuccessMessage('Gagal mengunggah COA: ' + (error instanceof Error ? error.message : 'kesalahan tidak diketahui'));
    } finally { setIsSavingTransaction(false); }
  };

  // Ambil persediaan live dari Google Sheets melalui Apps Script.
  const fetchInventoryData = async (forcedToken?: string) => {
    const token = forcedToken || localStorage.getItem(KJS_TOKEN_KEY);
    if (!token) {
      setInventoryError('Sesi tidak ditemukan. Silakan login kembali.');
      return;
    }

    setIsLoadingInventory(true);
    setInventoryError(null);
    try {
      const response = await fetch(KJS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'inventory', token }),
      });
      if (!response.ok) throw new Error('Server Apps Script merespons HTTP ' + response.status + '.');
      const result: InventoryApiResponse = await response.json();
      if (!result || result.success !== true || !Array.isArray(result.items)) {
        throw new Error(result?.message || 'Respons persediaan dari server tidak valid.');
      }
      const mapped: LiveInventoryItem[] = result.items.map(item => ({
        id: String(item.id || item.sku),
        sku: String(item.sku || ''),
        name: String(item.name || ''),
        category: item.category,
        stock: item.stock === null || item.stock === undefined ? null as unknown as number : Number(item.stock),
        minStock: Number(item.minStock || 0),
        unit: String(item.unit || 'Unit'),
        location: String(item.location || 'Lokasi belum diatur'),
        lastUpdated: String(item.lastUpdated || result.updatedAt || ''),
        stockError: item.stockError || '',
      }));
      setInventory(mapped);
      setInventoryUpdatedAt(result.updatedAt || new Date().toISOString());
      setInventoryError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal memuat persediaan.';
      if (/token|sesi|expired|kedaluwarsa|unauthorized|invalid/i.test(message)) {
        localStorage.removeItem(KJS_TOKEN_KEY);
        setIsLoggedIn(false);
        setLoginError('Sesi Anda telah kedaluwarsa. Silakan masuk kembali.');
      }
      setInventoryError(/failed to fetch|networkerror|load failed/i.test(message)
        ? 'Tidak dapat terhubung ke Google Apps Script. Periksa koneksi dan deployment Web App.'
        : message);
    } finally {
      setIsLoadingInventory(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && activeTab === 'Transaksi' && mode === 'interactive' && materials.length === 0 && !isLoadingFormData) {
      loadStockInFormData();
    }
  }, [isLoggedIn, activeTab, mode]);

  // Muat persediaan setelah login; tidak menggunakan data contoh lokal.
  useEffect(() => {
    if (isLoggedIn) fetchInventoryData();
  }, [isLoggedIn]);

  // Muat data dashboard saat pengguna terautentikasi
  useEffect(() => {
    if (isLoggedIn && !dashboardData && !isLoadingDashboard && !dashboardError) {
      fetchDashboardData();
    }
  }, [isLoggedIn]);


  // Memuat riwayat kartu stok aktual dari Google Sheets untuk Bahan Baku, Bahan Pengemas, dan Produk Jadi.
  const loadStockCard = async (kode?: string, kategori?: 'BAHAN BAKU' | 'BAHAN PENGEMAS' | 'PRODUK JADI') => {
    const selectedValue = String(kode || stockCardCode || '').trim();
    const category = kategori || stockCardCategory;
    // Untuk produk jadi, dropdown menyimpan ID PRODUK:kode:kemasan dari API inventory.
    // Jangan mengirim SKU gabungan (kode-kemasan) sebagai Kode Produk karena tidak cocok dengan MASTER_PRODUK.
    let code = selectedValue;
    let packaging = '';
    if (category === 'PRODUK JADI' && selectedValue.startsWith('PRODUK:')) {
      const parts = selectedValue.split(':');
      code = String(parts[1] || '').trim();
      packaging = parts.slice(2).join(':').trim();
    }
    if (!code) {
      setStockCardData(null);
      setStockCardError('Pilih barang terlebih dahulu.');
      return;
    }

    setStockCardLoading(true);
    setStockCardError('');
    try {
      let result: any = null;

      if (category === 'PRODUK JADI') {
        // Endpoint khusus produk jadi adalah jalur utama.
        try {
          result = await callKjsApi<any>({
            action: 'productStockCard',
            kodeProduk: code,
            kode: code,
            kemasan: packaging,
            category: 'PRODUK JADI'
          });
        } catch {
          result = null;
        }

        // Fallback juga dilakukan bila API mengembalikan success:false atau
        // bentuk data tanpa transactions (bukan hanya ketika request melempar error).
        const firstData = result?.data || result;
        if (!result || result.success === false || !Array.isArray(firstData?.transactions)) {
          result = await callKjsApi<any>({
            action: 'materialStockCard',
            kodeProduk: code,
            kodeBahan: code,
            kode: code,
            kemasan: packaging,
            category: 'PRODUK JADI'
          });
        }
      } else {
        result = await callKjsApi<any>({
          action: 'materialStockCard',
          kodeBahan: code,
          category
        });
      }

      if (!result || result.success === false) {
        throw new Error(result?.message || 'Kartu stok gagal dimuat.');
      }

      const data = result.data || result;
      if (!Array.isArray(data.transactions)) {
        throw new Error('Respons kartu stok tidak memuat daftar riwayat transaksi.');
      }

      // Normalisasi hanya untuk produk jadi. Data bahan baku dan pengemas tidak diubah.
      if (category === 'PRODUK JADI') {
        data.transactions = data.transactions.map((row: any) => ({
          ...row,
          source: row.source || row.jenis || row.sumber || 'Transaksi Produk',
          stockIn: Number(row.stockIn ?? row.masuk ?? row.qtyMasuk ?? 0),
          stockOut: Number(row.stockOut ?? row.keluar ?? row.qtyKeluar ?? 0),
          saldo: row.saldo ?? row.balance ?? row.currentStock ?? row.stok,
          satuan: row.satuan || data.satuan || 'Pcs',
          batch: row.batch || row.noBatch || row.nomorBatch || '',
          keterangan: row.keterangan || row.catatan || '',
          petugas: row.petugas || row.user || ''
        }));
        data.satuan = data.satuan || 'Pcs';
        data.nama = data.nama || data.namaProduk || data.kode || code;
      }

      setStockCardData(data);
    } catch (error) {
      setStockCardData(null);
      setStockCardError(error instanceof Error ? error.message : 'Gagal memuat kartu stok.');
    } finally {
      setStockCardLoading(false);
    }
  };

  const loadMaterialStockCard = loadStockCard;

  const loadReceiptRecords = async (category = receiptCategory) => {
    const token = localStorage.getItem(KJS_TOKEN_KEY);
    if (!token) return;
    setReceiptLoading(true);
    setReceiptError('');
    try {
      const result = await callKjsApi<any>({ action: 'getStockInRecords', token, category });
      if (!result || result.success === false) throw new Error(result?.message || 'Catatan penerimaan gagal dimuat.');
      const rows = Array.isArray(result.items) ? result.items : Array.isArray(result.data) ? result.data : [];
      setReceiptRecords(rows);
    } catch (error) {
      setReceiptRecords([]);
      setReceiptError(error instanceof Error ? error.message : 'Catatan penerimaan gagal dimuat.');
    } finally {
      setReceiptLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && activeTab === 'Catatan Penerimaan') loadReceiptRecords(receiptCategory);
  }, [isLoggedIn, activeTab, receiptCategory]);

  const visibleReceiptRecords = receiptRecords.filter(row => {
    const date = String(row.tanggal || '').slice(0, 10);
    const query = receiptSearch.trim().toLowerCase();
    const searchable = [row.kodeBahan, row.namaBahan, row.batch, row.supplier, row.petugas, row.qc].join(' ').toLowerCase();
    if (query && !searchable.includes(query)) return false;
    if (receiptDateFrom && date && date < receiptDateFrom) return false;
    if (receiptDateTo && date && date > receiptDateTo) return false;
    if (receiptQcFilter !== 'Semua QC' && row.qc !== receiptQcFilter) return false;
    if (receiptSupplierFilter !== 'Semua supplier' && row.supplier !== receiptSupplierFilter) return false;
    return true;
  });
  const receiptSuppliers = Array.from(new Set(receiptRecords.map(row => row.supplier).filter(Boolean))).sort();
  const receiptQcStatuses = Array.from(new Set(receiptRecords.map(row => row.qc).filter(Boolean))).sort();
  const receiptTotalQty = visibleReceiptRecords.reduce((total, row) => total + Number(row.qty || 0), 0);

  useEffect(() => {
    if (isLoggedIn && activeTab === 'Kartu Stok' && stockCardCode) {
      loadMaterialStockCard(stockCardCode, stockCardCategory);
    }
  }, [isLoggedIn, activeTab, stockCardCode, stockCardCategory]);


  const closeStockInDetailModal = () => {
    setStockInDetailOpen(false);
    setStockInDetailNotice(null);
    setCloseStockInDetailAfterNotice(false);
    setStockInEdit(null);
    setStockInDetail(null);
    setStockInCoaFile(null);
    setStockInDocuments([]);
    setStockInDetailSaving(false);
  };

  const openStockInDetail = async (row: any) => {
    if (String(row?.source || '').toUpperCase() !== 'STOK MASUK') return;
    setStockInDetailOpen(true);
    setStockInDetailLoading(true);
    setStockInDetail(null);
    setStockInEdit(null);
    setStockInDocuments([]);
    setStockInCoaFile(null);
    setStockInDetailNotice(null);
    try {
      const found = await callKjsApi<any>({
        action: 'findStockInTransaction',
        kodeBahan: stockCardCode,
        batch: String(row.batchBahan || row.batch || ''),
        tanggal: String(row.tanggal || '')
      });
      if (!found?.success || !found?.id) throw new Error(found?.message || 'ID transaksi stok masuk tidak ditemukan.');
      const detailResponse = await callKjsApi<any>({ action: 'getStockInDetail', idStokMasuk: found.id });
      // API bisa membungkus data lebih dari satu lapis: {success,data:{success,data:{...}}}.
      let detail: any = detailResponse;
      for (let i = 0; i < 3 && detail && !detail.id; i++) {
        if (detail.data) detail = detail.data;
        else if (detail.result) detail = detail.result;
        else break;
      }
      if (!detail || !detail.id) {
        throw new Error(detailResponse?.message || detail?.message || 'Detail transaksi tidak berhasil dimuat. Periksa ID transaksi dan respons API.');
      }
      setStockInDetail(detail);
      // Modal form membaca stockInEdit, bukan stockInDetail. Keduanya harus diisi.
      setStockInEdit({ ...detail });
      if (stockCardCategory === 'BAHAN BAKU') {
        const docsResponse = await callKjsApi<any>({ action: 'getMaterialDocuments', idStokMasuk: detail.id });
        const docs = Array.isArray(docsResponse) ? docsResponse : (docsResponse?.dokumen || docsResponse?.documents || docsResponse?.data || []);
        setStockInDocuments(Array.isArray(docs) ? docs : []);
      } else {
        setStockInDocuments([]);
      }
    } catch (error) {
      setStockInDetailNotice({ type: 'error', message: error instanceof Error ? error.message : 'Gagal membuka detail stok masuk.' });
    } finally {
      setStockInDetailLoading(false);
    }
  };

const saveStockInDetailEdit = async () => {
  if (!stockInEdit?.id || stockInDetailSaving) return;

  setStockInDetailSaving(true);
  setStockInDetailNotice(null);

  try {
    const result = await callKjsApi<any>({
      action: 'updateStockInEdit',
      data: {
        id: stockInEdit.id,
        tanggal: stockInEdit.tanggal,
        batch: stockInEdit.batch,
        expiredDate: stockInEdit.expiredDate,
        qty: Number(stockInEdit.qty),
        hargaPembelian: Number(stockInEdit.hargaPembelian),
        ongkosKirim: Number(stockInEdit.ongkosKirim || 0),
        qc: stockInEdit.qc
      }
    });

    if (!result || result.success !== true) {
      throw new Error(
        result?.message || 'Data stok masuk gagal diperbarui.'
      );
    }

    // Tampilkan popup hasil di tengah layar. Modal ditutup hanya setelah tombol OK.
    setCloseStockInDetailAfterNotice(true);
    setStockInDetailNotice({
      type: 'success',
      message: 'Perubahan data stok masuk berhasil disimpan.'
    });

    // Refresh data tanpa menghilangkan notifikasi keberhasilan.
    try {
      await Promise.allSettled([
        loadMaterialStockCard(stockCardCode, stockCardCategory),
        fetchInventoryData()
      ]);
    } catch (refreshError) {
      console.error(
        '[KJS] Gagal memperbarui tampilan setelah penyimpanan:',
        refreshError
      );
    }

  } catch (error) {
    // Jika gagal, pertahankan modal dan data edit agar bisa diperbaiki.
    setCloseStockInDetailAfterNotice(false);
    setStockInDetailNotice({
      type: 'error',
      message: error instanceof Error
        ? error.message
        : 'Gagal memperbarui data stok masuk.'
    });
  } finally {
    setStockInDetailSaving(false);
  }
};

  const uploadCoaForExistingStockIn = async () => {
    if (!stockInDetail?.id || !stockInCoaFile) {
      setStockInDetailNotice({ type: 'error', message: 'Pilih file COA terlebih dahulu.' });
      return;
    }
    if (!['application/pdf','image/jpeg','image/png','image/webp'].includes(stockInCoaFile.type) || stockInCoaFile.size > 8 * 1024 * 1024) {
      setStockInDetailNotice({ type: 'error', message: 'File harus PDF/JPG/PNG/WEBP dengan ukuran maksimal 8 MB.' });
      return;
    }
    setStockInDetailSaving(true);
    setStockInDetailNotice(null);
    try {
      const base64 = await readFileAsBase64(stockInCoaFile);
      const result = await callKjsApi<any>({ action: 'uploadMaterialDocument', payload: {
        idStokMasuk: stockInDetail.id,
        jenisDokumen: 'COA',
        tanggalDokumen: stockInDetail.tanggal,
        namaFile: stockInCoaFile.name,
        mimeType: stockInCoaFile.type,
        base64
      }});
      if (result?.success === false) throw new Error(result.message || 'Upload COA gagal.');
      setStockInCoaFile(null);
      const docsResponse = await callKjsApi<any>({ action: 'getMaterialDocuments', idStokMasuk: stockInDetail.id });
      const docs = Array.isArray(docsResponse) ? docsResponse : (docsResponse?.dokumen || docsResponse?.documents || docsResponse?.data || []);
      setStockInDocuments(Array.isArray(docs) ? docs : []);
      setCloseStockInDetailAfterNotice(false);
      setStockInDetailNotice({ type: 'success', message: 'COA berhasil diunggah dan ditautkan ke transaksi ' + stockInDetail.id + '.' });
    } catch (error) {
      setCloseStockInDetailAfterNotice(false);
      setStockInDetailNotice({ type: 'error', message: error instanceof Error ? error.message : 'Gagal mengunggah COA.' });
    } finally { setStockInDetailSaving(false); }
  };

  // Login menggunakan autentikasi server Apps Script, bukan akun demo lokal.
  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const username = inputUsername.trim();
    const password = inputPassword;

    if (!username || !password) {
      setLoginError('Username dan password wajib diisi.');
      return;
    }

    setIsLoggingIn(true);
    setLoginError('');

    try {
      const response = await fetch(KJS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'login', username, password }),
      });

      if (!response.ok) {
        throw new Error('Server Apps Script merespons HTTP ' + response.status + '.');
      }

      const result = await response.json();
      if (!result || result.success !== true || !result.token || !result.user) {
        throw new Error(result?.message || 'Login gagal. Periksa username dan password pada sheet USERS.');
      }

      localStorage.setItem(KJS_TOKEN_KEY, result.token);
      setUserName(result.user.nama || result.user.username || username);
      setRole(String(result.user.role || 'KARYAWAN').trim().toUpperCase());
      setIsLoggedIn(true);
      setLoginError('');
      setInputPassword('');
      setActiveTab('Beranda');
      // Panggil API dashboard menggunakan token autentikasi yang dikembalikan server
      fetchDashboardData(result.token);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Tidak dapat menghubungi server KJS.';
      if (/failed to fetch|networkerror|load failed/i.test(message)) {
        setLoginError('Tidak dapat mengakses API. Periksa deployment Apps Script dan izin Web App; browser mungkin memblokir CORS.');
      } else {
        setLoginError(message);
      }
      setIsLoggedIn(false);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => setShowLogoutConfirm(true);

  const confirmLogout = async () => {
    setShowLogoutConfirm(false);
    const token = localStorage.getItem(KJS_TOKEN_KEY);
    try {
      if (token) {
        await fetch(KJS_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'logout', token }),
        });
      }
    } catch (error) {
      console.warn('Logout server tidak terjangkau; token lokal tetap dihapus.', error);
    }
    localStorage.removeItem(KJS_TOKEN_KEY);
    setIsLoggedIn(false);
    setInputPassword('');
    setDashboardData(null);
    setDashboardError(null);
    setActiveTab('Beranda');
  };

  const fillCredentials = (user: 'admin' | 'karyawan') => {
    setInputUsername(user);
    setInputPassword('kjs123');
    setLoginError('');
  };

  const resetAll = () => {
    setIsLoggedIn(false);
    setInputUsername('');
    setInputPassword('');
    setActiveTab('Beranda');
    setDashboardData(null);
    setDashboardError(null);
    setInventory([]);
    setInventoryUpdatedAt(null);
    setInventoryError(null);
    setTrxSuccessMessage(null);
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrxSuccessMessage(null);
    setTrxResultModal(null);
    if (trxType !== 'MASUK') {
      const message = 'Stok Keluar Android belum diaktifkan. Belum ada perubahan stok. Untuk tahap ini, gunakan Stok Masuk Bahan Baku.';
      setTrxSuccessMessage(message);
      setTrxResultModal({ type: 'error', title: 'Transaksi belum tersedia', message });
      return;
    }

    // Validasi pemilihan bahan baku aktif dari master
    const chosenMaterial = materials.find(m => m.kategori?.toUpperCase().includes(trxMaterialCategory === 'BAHAN PENGEMAS' ? 'KEMAS' : 'BAKU') && m.kode.toUpperCase() === String(selectedItemId || '').trim().toUpperCase())
      || materials.find(m => m.kategori?.toUpperCase().includes(trxMaterialCategory === 'BAHAN PENGEMAS' ? 'KEMAS' : 'BAKU') && m.kode === selectedItemId);
    const materialCode = chosenMaterial ? chosenMaterial.kode.trim() : String(selectedItemId || '').trim();

    if (!materialCode) {
      const msg = 'Bahan baku belum dipilih atau master bahan belum dimuat. Silakan pilih salah satu bahan baku aktif dari daftar.';
      setTrxSuccessMessage(msg);
      setTrxResultModal({ type: 'error', title: 'Bahan belum dipilih', message: msg });
      return;
    }

    if (!trxDate || !trxBatch.trim() || !trxExpiry || !trxSupplier || !trxQc || !Number(trxQty) || Number(trxQty) <= 0) {
      setTrxSuccessMessage('Lengkapi bahan, tanggal, batch, expired date, jumlah, supplier, dan status QC.');
      setTrxResultModal({ type: 'error', title: 'Data belum lengkap', message: 'Periksa bahan, tanggal, batch, expired date, jumlah, supplier, dan status QC.' });
      return;
    }
    if (!Number.isFinite(Number(trxHargaPembelian)) || Number(trxHargaPembelian) <= 0 || !Number.isFinite(Number(trxOngkosKirim)) || Number(trxOngkosKirim) < 0 || (Number(trxHargaPembelian) + Number(trxOngkosKirim)) <= 0) {
      const msg = 'Harga pembelian wajib diisi lebih dari 0. Ongkos kirim boleh 0. Total biaya = harga pembelian + ongkos kirim.';
      setTrxSuccessMessage('GAGAL SIMPAN: ' + msg);
      setTrxResultModal({ type: 'error', title: 'Gagal menyimpan', message: msg });
      return;
    }

    if (coaFile && coaExists) {
      const message = 'COA sudah tersedia untuk batch ini. Hapus pilihan file jika tidak ingin mengunggah dokumen duplikat.';
      setTrxSuccessMessage(message);
      setTrxResultModal({ type: 'error', title: 'COA sudah tersedia', message });
      return;
    }
    if (coaFile && (!['application/pdf','image/jpeg','image/png','image/webp'].includes(coaFile.type) || coaFile.size > 8 * 1024 * 1024)) {
      const message = 'File COA harus PDF/JPG/PNG/WEBP dengan ukuran maksimal 8 MB.';
      setTrxSuccessMessage(message);
      setTrxResultModal({ type: 'error', title: 'File COA tidak valid', message });
      return;
    }
    setIsSavingTransaction(true);
    try {
      const chosenSupplier = suppliers.find(s => s.kode.toUpperCase() === String(trxSupplier || '').trim().toUpperCase())
        || suppliers.find(s => s.kode === trxSupplier);
      const supplierCode = chosenSupplier ? chosenSupplier.kode.trim() : String(trxSupplier || '').trim();
      const supplierName = chosenSupplier ? chosenSupplier.nama.trim() : supplierCode;

      const qtyNum = Number(trxQty);
      const hargaBeliNum = Number(trxHargaPembelian);
      const ongkirNum = Number(trxOngkosKirim) || 0;
      const hargaSatuanNum = qtyNum > 0 ? (hargaBeliNum + ongkirNum) / qtyNum : 0;

      // Payload lengkap yang selaras dengan simpanStokMasuk(token, data) pada Web App KJS
      const stockInData = {
        jenisTransaksi: 'STOK MASUK',
        tanggal: trxDate,
        kodeBahan: materialCode,
        kode: materialCode,
        idBahan: materialCode,
        namaBahan: chosenMaterial?.nama || materialCode,
        satuan: chosenMaterial?.satuan || 'gram',
        kategori: trxMaterialCategory,
        kategoriBahan: trxMaterialCategory,
        batch: trxBatch.trim(),
        expiredDate: trxExpiry,
        qty: qtyNum,
        hargaPembelian: hargaBeliNum,
        ongkosKirim: ongkirNum,
        hargaSatuan: hargaSatuanNum,
        supplier: supplierCode,
        kodeSupplier: supplierCode,
        namaSupplier: supplierName,
        qc: trxQc,
        petugas: trxPic.trim() || userName,
        keterangan: trxNotes.trim()
      };

      const saved = await callKjsApi<StockInApiResponse>({
        action: 'saveStockIn',
        data: stockInData,
        payload: stockInData,
        ...stockInData
      });
      console.log('[KJS saveStockIn] Respons server:', saved);
      if (!saved || saved.success !== true || !saved.data?.id) {
        throw new Error(saved?.message || 'Server tidak mengembalikan ID transaksi. Pastikan AndroidApi.gs sudah disimpan dan Web App sudah di-deploy ke versi terbaru.');
      }
      const idStokMasuk = String(saved.data.id);
      setSavedStockInId(idStokMasuk);
      let message = 'Stok masuk berhasil disimpan ke Google Sheets.';
      if (coaFile) {
        try {
          const base64 = await readFileAsBase64(coaFile);
          await callKjsApi({ action: 'uploadMaterialDocument', payload: {
            idStokMasuk,
            jenisDokumen: 'COA',
            tanggalDokumen: trxDate,
            namaFile: coaFile.name,
            mimeType: coaFile.type,
            base64,
          }});
          message += ' COA berhasil diunggah.';
          setCoaStatus('COA sudah tersedia untuk batch ini.');
          setCoaExists(true);
          setCoaFile(null);
        } catch (uploadError) {
          message += ' Transaksi tersimpan, tetapi unggah COA gagal: ' + (uploadError instanceof Error ? uploadError.message : 'kesalahan tidak diketahui') + '. Unggah COA melalui transaksi yang tersimpan.';
        }
      } else {
        message += ' COA dapat ditambahkan nanti.';
      }
      setTrxSuccessMessage(message);
      setTrxResultModal({ type: 'success', title: 'Transaksi berhasil disimpan', message });
      setTrxNotes('');
      setTrxBatch('');
      setTrxQty(10);
      setTrxHargaPembelian(0);
      setTrxOngkosKirim(0);
      void Promise.allSettled([
        fetchInventoryData(),
        fetchDashboardData()
      ]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Gagal menyimpan stok masuk. Periksa koneksi dan deployment Apps Script.';
      console.error('[KJS saveStockIn] Gagal:', error);
      setTrxSuccessMessage('GAGAL SIMPAN: ' + errorMessage);
      setTrxResultModal({ type: 'error', title: 'Gagal menyimpan transaksi', message: errorMessage });
    } finally { setIsSavingTransaction(false); }
  };

  // Helper getters untuk ringkasan dari Google Sheets API (Dashboard)
  const bahanAktifValue = dashboardData?.summary
    ? (dashboardData.summary.bahanAktif ?? dashboardData.summary.activeMaterials ?? dashboardData.summary.totalBahan ?? dashboardData.summary.rawMaterials ?? '0')
    : '—';

  const produkAktifValue = dashboardData?.summary
    ? (dashboardData.summary.produkAktif ?? dashboardData.summary.activeProducts ?? dashboardData.summary.totalProduk ?? (Array.isArray(dashboardData.products) ? dashboardData.products.length : '0'))
    : (Array.isArray(dashboardData?.products) ? dashboardData.products.length : '—');

  const supplierAktifValue = dashboardData?.summary
    ? (dashboardData.summary.supplierAktif ?? dashboardData.summary.activeSuppliers ?? dashboardData.summary.totalSupplier ?? dashboardData.summary.suppliers ?? '0')
    : '—';

  const riwayatProduksiCount = Array.isArray(dashboardData?.recentProduction)
    ? dashboardData.recentProduction.length
    : (dashboardData?.summary?.totalProduksi ?? (dashboardData ? '0' : '—'));

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'Semua' || item.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <>
    {showLogoutConfirm && (
      <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/55 p-5" role="dialog" aria-modal="true" aria-labelledby="logout-confirm-title">
        <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div className="border-b border-slate-100 px-5 py-4">
            <h3 id="logout-confirm-title" className="text-lg font-bold text-slate-900">Keluar dari aplikasi?</h3>
            <p className="mt-1 text-sm leading-5 text-slate-600">Anda perlu masuk kembali untuk membuka data persediaan.</p>
          </div>
          <div className="flex gap-3 bg-slate-50 px-5 py-4">
            <button type="button" autoFocus onClick={() => setShowLogoutConfirm(false)} className="flex-1 rounded-xl border border-slate-300 bg-white py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100">Batal</button>
            <button type="button" onClick={confirmLogout} className="flex-1 rounded-xl bg-[#1877F2] py-2.5 text-sm font-bold text-white hover:bg-[#166FE5]">Keluar</button>
          </div>
        </div>
      </div>
    )}
    {(isSavingTransaction || stockInDetailSaving) && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-5" role="status" aria-live="polite">
        <div className="w-full max-w-xs rounded-2xl bg-white p-6 text-center shadow-2xl">
          <div className="mx-auto mb-4 h-11 w-11 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />
          <h3 className="text-base font-bold text-slate-800">
  {stockInDetailSaving
    ? 'Menyimpan perubahan...'
    : 'Menyimpan transaksi...'}
</h3>
          <p className="mt-2 text-sm text-slate-500">
  {stockInDetailSaving
    ? 'Mohon tunggu. Perubahan data sedang disimpan ke Google Sheets.'
    : 'Mohon tunggu. Data sedang dikirim ke Google Sheets.'}
</p>
          <p className="mt-3 text-xs text-slate-400">Jangan tutup halaman atau tekan simpan berulang kali.</p>
        </div>
      </div>
    )}
    {trxResultModal && !isSavingTransaction && (
      <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 p-5" role="dialog" aria-modal="true" aria-labelledby="trx-result-title">
        <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
          <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full ${trxResultModal.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
            {trxResultModal.type === 'success' ? <CheckCircle2 className="h-7 w-7" /> : <AlertTriangle className="h-7 w-7" />}
          </div>
          <h3 id="trx-result-title" className="text-center text-lg font-bold text-slate-900">{trxResultModal.title}</h3>
          <p className="mt-3 whitespace-pre-wrap break-words text-center text-sm leading-6 text-slate-600">{trxResultModal.message}</p>
          <button
            type="button"
            autoFocus
            onClick={() => {
              const isSuccess = trxResultModal.type === 'success';
              setTrxResultModal(null);
              if (isSuccess) {
                if (selectedItemId) {
                  setStockCardCategory(trxMaterialCategory);
                  setStockCardCode(selectedItemId);
                }
                setActiveTab('Kartu Stok');
                void Promise.allSettled([
                  fetchInventoryData(),
                  fetchDashboardData(),
                  selectedItemId ? loadStockCard(selectedItemId, trxMaterialCategory) : Promise.resolve()
                ]);
              }
            }}
            className={`mt-5 w-full rounded-xl py-3 text-sm font-bold text-white transition-colors ${
              trxResultModal.type === 'success' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
            }`}
          >
            OK
          </button>
        </div>
      </div>
    )}
    {stockInDetailNotice && !stockInDetailSaving && (
      <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/60 p-5" role="dialog" aria-modal="true" aria-labelledby="stock-in-detail-result-title">
        <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
          <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full ${stockInDetailNotice.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
            {stockInDetailNotice.type === 'success' ? <CheckCircle2 className="h-7 w-7" /> : <AlertTriangle className="h-7 w-7" />}
          </div>
          <h3 id="stock-in-detail-result-title" className="text-center text-lg font-bold text-slate-900">
            {stockInDetailNotice.type === 'success' ? 'Perubahan berhasil disimpan' : 'Gagal menyimpan perubahan'}
          </h3>
          <p className="mt-3 whitespace-pre-wrap break-words text-center text-sm leading-6 text-slate-600">{stockInDetailNotice.message}</p>
          <button
            type="button"
            autoFocus
            onClick={() => {
              const tutupModal = closeStockInDetailAfterNotice && stockInDetailNotice.type === 'success';
              setStockInDetailNotice(null);
              setCloseStockInDetailAfterNotice(false);
              if (tutupModal) closeStockInDetailModal();
            }}
            className={`mt-5 w-full rounded-xl py-3 text-sm font-bold text-white transition-colors ${stockInDetailNotice.type === 'success' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}
          >OK</button>
        </div>
      </div>
    )}
    <div className={standalone ? 'fixed inset-0 h-[100dvh] w-full overflow-hidden bg-[#F4F7FB]' : 'flex flex-col items-center'}>
      {/* Top simulator toolbar */}
      {!standalone && <div className="w-full max-w-4xl mb-4 p-3 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#14263D] flex items-center justify-center text-white">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#14263D] tracking-wide uppercase">
              Simulator Android (Kotlin + Jetpack Compose)
            </h3>
            <p className="text-[11px] text-[#64748B]">
              Preview tampilan native sesuai file <code className="font-mono text-blue-600 font-semibold">MainActivity.kt</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode toggle */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs">
            <button
              onClick={() => setMode('starter')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                mode === 'starter'
                  ? 'bg-white text-[#14263D] shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Sesuai file starter asli dengan data '—' dan tab placeholder"
            >
              Mode Starter Asli
            </button>
            <button
              onClick={() => setMode('interactive')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                mode === 'interactive'
                  ? 'bg-[#246BFD] text-white shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Mode interaktif dengan data stok & transaksi aktif"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Demo Data Aktif
            </button>
          </div>

          <button
            onClick={() => setShowPhoneFrame(!showPhoneFrame)}
            className="p-1.5 px-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
            title="Toggle bingkai HP"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">{showPhoneFrame ? 'Frame: ON' : 'Frame: OFF'}</span>
          </button>

          <button
            onClick={resetAll}
            className="p-1.5 px-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
            title="Reset Simulator"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>}

      {/* Android Device Mockup */}
      <div className={standalone ? 'h-full w-full' : 'w-full flex justify-center items-center'}>
        <div
          className={`transition-all duration-300 mx-auto ${
            standalone
              ? 'h-full w-full max-w-none rounded-none border-0 shadow-none'
              : showPhoneFrame
              ? 'relative w-full max-w-[390px] h-[780px] bg-slate-900 rounded-[48px] p-3 shadow-2xl border-[6px] border-slate-800'
              : 'relative w-full max-w-[420px] h-[740px] rounded-2xl shadow-xl overflow-hidden border border-slate-200'
          }`}
        >
          {/* Hardware details when frame is enabled */}
          {showPhoneFrame && (
            <>
              {/* Speaker hole & camera punch */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-900 rounded-full z-30 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-slate-800 border border-slate-700/60" />
              </div>
              {/* Side volume / power buttons reflection */}
              <div className="absolute -left-[9px] top-28 w-1 h-12 bg-slate-700 rounded-l" />
              <div className="absolute -left-[9px] top-44 w-1 h-12 bg-slate-700 rounded-l" />
              <div className="absolute -right-[9px] top-32 w-1 h-16 bg-slate-700 rounded-r" />
            </>
          )}

          {/* Screen container */}
          <div data-theme={theme} className={`w-full h-full bg-[#F4F7FB] overflow-hidden flex flex-col ${standalone ? 'rounded-none' : 'rounded-[36px]'} relative text-[#1E293B]`}>

            {/* Screen Content Body */}
            {!isLoggedIn ? (
              /* ================= LOGIN SCREEN ================= */
              <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-[340px] flex flex-col items-center my-auto py-2">
                  {/* App Icon Box */}
                  <div className="w-18 h-18 bg-[#14263D] rounded-[22px] flex items-center justify-center shadow-lg shadow-slate-900/10 mb-4.5">
                    <Boxes className="w-9 h-9 text-white" />
                  </div>

                  {/* Title & Company */}
                  <h1 className="text-[23px] font-extrabold text-[#14263D] tracking-tight">
                    KJS INVENTORY
                  </h1>
                  <p className="text-[13px] text-[#64748B] font-medium mt-1 mb-6">
                    PT Kilau Jaya Sejahtera
                  </p>

                  {/* Login Card */}
                  <div className="w-full bg-white rounded-[24px] p-5 shadow-sm border border-slate-100">
                    <h2 className="text-[19px] font-bold text-[#1E293B]">
                      Masuk ke akun
                    </h2>
                    <p className="text-[12px] text-[#64748B] mt-1 mb-5">
                      Gunakan akun yang terdaftar di sistem KJS.
                    </p>

                    <form onSubmit={handleLogin} className="space-y-3.5">
                      {/* Username Field */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                          Username
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <User className="w-4 h-4" />
                          </div>
                          <input
                            type="text"
                            value={inputUsername}
                            onChange={(e) => setInputUsername(e.target.value)}
                            placeholder="Username terdaftar di KJS"
                            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-[14px] text-xs font-medium text-[#1E293B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#246BFD]/20 focus:border-[#246BFD] transition-all"
                          />
                        </div>
                      </div>

                      {/* Password Field */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                          Password
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <Lock className="w-4 h-4" />
                          </div>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={inputPassword}
                            onChange={(e) => setInputPassword(e.target.value)}
                            placeholder="Password akun"
                            className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-[14px] text-xs font-medium text-[#1E293B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#246BFD]/20 focus:border-[#246BFD] transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {loginError && (
                        <p className="text-[11px] text-rose-500 font-medium">{loginError}</p>
                      )}

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isLoggingIn}
                        className="w-full mt-3 py-3 px-4 bg-[#246BFD] hover:bg-blue-600 disabled:opacity-60 disabled:cursor-wait active:scale-[0.98] text-white rounded-[14px] text-xs font-bold tracking-wide flex items-center justify-center gap-2 shadow-sm transition-all"
                      >
                        <span>{isLoggingIn ? 'MEMERIKSA AKUN...' : 'MASUK'}</span>
                        {!isLoggingIn && <ArrowRight className="w-4 h-4" />}
                      </button>

                      {/* Starter note from MainActivity.kt */}
                      <p className="text-[10px] text-[#64748B] text-center leading-relaxed pt-2">
                        Login diverifikasi melalui server Apps Script KJS.
                      </p>
                    </form>
                  </div>
                </div>
              </div>
            ) : (
              /* ================= LOGGED IN SCREENS ================= */
              <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                {/* Scrollable Content Area */}
                <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-5 pb-8 space-y-4">
                  {/* TAB 1: BERANDA */}
                  {activeTab === 'Beranda' && (
                    <div className="space-y-4">
                      {dashboardSubView ? (
                        /* Sub-View Screen for Bahan Aktif / Produk Aktif / Supplier Aktif */
                        <div className="space-y-3">
                          <div className="sticky -top-5 -mt-5 -mx-5 p-5 pb-3 bg-[#F4F7FB]/95 backdrop-blur-xs z-10 border-b border-slate-200/60 flex items-center justify-between gap-2 shadow-2xs">
                            <div className="flex items-center gap-2.5">
                              <button
                                type="button"
                                onClick={() => { setDashboardSubView(null); setSelectedDashboardItemHistory(null); }}
                                className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
                                title="Kembali ke Dashboard"
                              >
                                <ArrowLeft className="w-4 h-4" />
                              </button>
                              <div>
                                <h3 className="text-[17px] font-bold text-[#14263D] leading-tight">
                                  {dashboardSubView === 'bahan' && (dashboardMaterialCategory === 'BAHAN BAKU' ? 'Daftar Bahan Baku' : 'Daftar Bahan Pengemas')}
                                  {dashboardSubView === 'produk' && 'Daftar Produk Jadi'}
                                  {dashboardSubView === 'supplier' && 'Daftar Supplier'}
                                </h3>
                                <p className="text-[10px] text-[#64748B]">
                                  {dashboardSubView === 'bahan' && 'Data bahan baku dan pengemas & saldo stok dari Google Sheets'}
                                  {dashboardSubView === 'produk' && 'Katalog produk jadi & saldo dari Google Sheets'}
                                  {dashboardSubView === 'supplier' && 'Data mitra pemasok dari Google Sheets'}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                if (dashboardSubView === 'supplier') {
                                  loadStockInFormData();
                                } else {
                                  fetchInventoryData();
                                }
                              }}
                              className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#246BFD] hover:bg-blue-50 transition-colors shadow-2xs"
                              title="Segarkan data"
                            >
                              <RotateCw className={`w-3.5 h-3.5 ${(isLoadingInventory || isLoadingFormData) ? 'animate-spin' : ''}`} />
                            </button>
                          </div>

                          {/* Search bar */}
                          <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                            <input
                              type="text"
                              value={dashboardSubSearch}
                              onChange={e => setDashboardSubSearch(e.target.value)}
                              placeholder={
                                dashboardSubView === 'bahan'
                                  ? 'Cari kode atau nama bahan...'
                                  : dashboardSubView === 'produk'
                                  ? 'Cari kode atau nama produk...'
                                  : 'Cari nama atau kode supplier...'
                              }
                              className="w-full pl-9 pr-8 py-2.5 bg-white rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#246BFD] shadow-xs"
                            />
                            {dashboardSubSearch && (
                              <button onClick={() => setDashboardSubSearch('')} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          {/* Content List: Bahan */}
                          {dashboardSubView === 'bahan' && (() => {
                            const q = dashboardSubSearch.toLowerCase().trim();
                            const bahanList = inventory.filter(item => {
                              const cat = String(item.category || '').toUpperCase();
                              const isBahan = dashboardMaterialCategory === 'BAHAN PENGEMAS'
                                ? cat.includes('KEMAS')
                                : (cat.includes('BAHAN BAKU') || cat === 'BAHAN' || (!cat.includes('KEMAS') && !cat.includes('PRODUK')));
                              const match = !q || item.name.toLowerCase().includes(q) || item.sku.toLowerCase().includes(q);
                              return isBahan && match;
                            });

                            if (isLoadingInventory && inventory.length === 0) {
                              return (
                                <div className="p-8 text-center bg-white rounded-2xl border border-slate-100">
                                  <RotateCw className="w-6 h-6 animate-spin text-[#246BFD] mx-auto mb-2" />
                                  <p className="text-xs text-slate-500">Memuat daftar bahan dari Google Sheets...</p>
                                </div>
                              );
                            }

                            if (bahanList.length === 0) {
                              return (
                                <div className="p-6 text-center bg-white rounded-2xl border border-slate-100 text-xs text-slate-500">
                                  {q ? 'Tidak ada bahan yang cocok dengan pencarian.' : 'Belum ada data bahan baku pada Google Sheets.'}
                                </div>
                              );
                            }

                            return (
                              <div className="space-y-2">
                                <div className="flex gap-2">
                                  <button onClick={() => setDashboardMaterialCategory('BAHAN BAKU')} className={`rounded-lg px-3 py-2 text-[10px] font-bold ${dashboardMaterialCategory === 'BAHAN BAKU' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600'}`}>Bahan Baku</button>
                                  <button onClick={() => setDashboardMaterialCategory('BAHAN PENGEMAS')} className={`rounded-lg px-3 py-2 text-[10px] font-bold ${dashboardMaterialCategory === 'BAHAN PENGEMAS' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600'}`}>Bahan Pengemas</button>
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  Ditemukan {bahanList.length} {dashboardMaterialCategory === 'BAHAN BAKU' ? 'Bahan Baku' : 'Bahan Pengemas'}
                                </p>
                                {bahanList.map(item => (
                                  <div
                                    key={item.id || item.sku}
                                    onClick={() => {
                                      setSelectedDashboardItemHistory({ item, category: dashboardMaterialCategory });
                                      loadStockCard(item.sku, dashboardMaterialCategory);
                                    }}
                                    className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs hover:border-blue-200 transition-all cursor-pointer group"
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="min-w-0">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                                            {item.sku}
                                          </span>
                                          <span className="text-[10px] text-slate-400 font-medium">
                                            {item.location || 'Gudang Bahan'}
                                          </span>
                                        </div>
                                        <h5 className="text-[13px] font-bold text-[#1E293B] mt-1 group-hover:text-[#246BFD] transition-colors">
                                          {item.name}
                                        </h5>
                                      </div>
                                      <div className="text-right shrink-0">
                                        <div className="text-[14px] font-black text-[#14263D]">
                                          {item.stock !== null && item.stock !== undefined
                                            ? Number(item.stock).toLocaleString('id-ID', { maximumFractionDigits: 3 })
                                            : '0'}
                                        </div>
                                        <span className="text-[10px] text-slate-500">{item.unit}</span>
                                      </div>
                                    </div>
                                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#246BFD] font-semibold">
                                      <span>Lihat riwayat pergerakan stok</span>
                                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            );
                          })()}

                          {/* Content List: Produk Jadi */}
                          {dashboardSubView === 'produk' && (() => {
                            const q = dashboardSubSearch.toLowerCase().trim();
                            const produkList = inventory.filter(item => {
                              const cat = String(item.category || '').toUpperCase();
                              const isProduk = cat.includes('PRODUK') || cat.includes('JADI');
                              const match = !q || item.name.toLowerCase().includes(q) || item.sku.toLowerCase().includes(q);
                              return isProduk && match;
                            });

                            if (isLoadingInventory && inventory.length === 0) {
                              return (
                                <div className="p-8 text-center bg-white rounded-2xl border border-slate-100">
                                  <RotateCw className="w-6 h-6 animate-spin text-[#246BFD] mx-auto mb-2" />
                                  <p className="text-xs text-slate-500">Memuat daftar produk jadi dari Google Sheets...</p>
                                </div>
                              );
                            }

                            if (produkList.length === 0) {
                              return (
                                <div className="p-6 text-center bg-white rounded-2xl border border-slate-100 text-xs text-slate-500">
                                  {q ? 'Tidak ada produk yang cocok dengan pencarian.' : 'Belum ada data produk jadi pada Google Sheets.'}
                                </div>
                              );
                            }

                            return (
                              <div className="space-y-2">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  Ditemukan {produkList.length} Produk Jadi
                                </p>
                                {produkList.map(item => (
                                  <div
                                    key={item.id || item.sku}
                                    onClick={() => {
                                      setSelectedDashboardItemHistory({ item, category: 'PRODUK JADI' });
                                      loadStockCard(item.sku, 'PRODUK JADI');
                                    }}
                                    className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs hover:border-blue-200 transition-all cursor-pointer group"
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="min-w-0">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">
                                            {item.sku}
                                          </span>
                                          <span className="text-[10px] text-slate-400 font-medium">
                                            {item.location || 'Gudang Produk'}
                                          </span>
                                        </div>
                                        <h5 className="text-[13px] font-bold text-[#1E293B] mt-1 group-hover:text-[#246BFD] transition-colors">
                                          {item.name}
                                        </h5>
                                      </div>
                                      <div className="text-right shrink-0">
                                        <div className="text-[14px] font-black text-[#14263D]">
                                          {item.stock !== null && item.stock !== undefined
                                            ? Number(item.stock).toLocaleString('id-ID', { maximumFractionDigits: 3 })
                                            : '0'}
                                        </div>
                                        <span className="text-[10px] text-slate-500">{item.unit || 'Pcs'}</span>
                                      </div>
                                    </div>
                                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#246BFD] font-semibold">
                                      <span>Lihat riwayat transaksi produk</span>
                                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            );
                          })()}

                          {/* Content List: Supplier */}
                          {dashboardSubView === 'supplier' && (() => {
                            const q = dashboardSubSearch.toLowerCase().trim();
                            const supplierList = suppliers.filter(item => {
                              const match = !q || item.nama.toLowerCase().includes(q) || item.kode.toLowerCase().includes(q) || (item.alamat && item.alamat.toLowerCase().includes(q));
                              return match;
                            });

                            if (isLoadingFormData && suppliers.length === 0) {
                              return (
                                <div className="p-8 text-center bg-white rounded-2xl border border-slate-100">
                                  <RotateCw className="w-6 h-6 animate-spin text-[#246BFD] mx-auto mb-2" />
                                  <p className="text-xs text-slate-500">Memuat daftar supplier dari Google Sheets...</p>
                                </div>
                              );
                            }

                            if (supplierList.length === 0) {
                              return (
                                <div className="p-6 text-center bg-white rounded-2xl border border-slate-100 text-xs text-slate-500">
                                  {q ? 'Tidak ada supplier yang cocok dengan pencarian.' : 'Belum ada data supplier pada Google Sheets.'}
                                </div>
                              );
                            }

                            return (
                              <div className="space-y-2">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  Ditemukan {supplierList.length} Supplier
                                </p>
                                {supplierList.map(item => (
                                  <div
                                    key={item.kode}
                                    onClick={() => setSelectedSupplierDetail(item)}
                                    className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs hover:border-blue-200 transition-all cursor-pointer group"
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="min-w-0">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <span className="text-[10px] font-mono font-bold bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded">
                                            {item.kode}
                                          </span>
                                        </div>
                                        <h5 className="text-[13px] font-bold text-[#1E293B] mt-1 group-hover:text-[#246BFD] transition-colors">
                                          {item.nama}
                                        </h5>
                                        {item.alamat && (
                                          <p className="text-[10px] text-[#64748B] mt-0.5 line-clamp-1">
                                            {item.alamat}
                                          </p>
                                        )}
                                        {item.kontak && (
                                          <p className="text-[10px] text-slate-500 mt-0.5">
                                            Kontak: {item.kontak}
                                          </p>
                                        )}
                                      </div>
                                      <div className="shrink-0 text-[#246BFD]">
                                        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                      </div>
                                    </div>
                                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-purple-700 font-semibold">
                                      <span>Lihat detail supplier</span>
                                      <ChevronRight className="w-3.5 h-3.5" />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            );
                          })()}
                        </div>
                      ) : (
                        /* Standard Home Dashboard Content */
                        <>
                      {/* Top greeting & Refresh button */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[11px] font-extrabold text-[#246BFD] tracking-wider uppercase">
                            KJS INVENTORY
                          </div>
                          <h2 className="text-[25px] font-black text-[#14263D] leading-tight">
                            Dashboard
                          </h2>
                          <p className="text-[13px] text-[#64748B]">Halo, {userName}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Tombol Refresh ke Google Apps Script */}
                          <button
                            onClick={() => fetchDashboardData()}
                            disabled={isLoadingDashboard}
                            className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-xs border border-slate-100 text-[#14263D] hover:bg-slate-50 disabled:opacity-50 transition-colors"
                            title="Segarkan data dari Google Sheets"
                          >
                            <RotateCw className={`w-4.5 h-4.5 text-[#246BFD] ${isLoadingDashboard ? 'animate-spin' : ''}`} />
                          </button>
                          <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-xs border border-slate-100 text-[#14263D]">
                            <Bell className="w-5 h-5" />
                          </div>
                        </div>
                      </div>

                      {/* Hero Navy Card */}
                      <div className="bg-[#14263D] text-white rounded-[22px] p-5 shadow-md">
                        <div className="text-[10px] font-bold tracking-wider text-white/70 uppercase">
                          PT KILAU JAYA SEJAHTERA
                        </div>
                        <h3 className="text-[20px] font-bold leading-tight mt-2 mb-3">
                          Pantau persediaan
                          <br />
                          lebih mudah.
                        </h3>
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="inline-flex items-center px-3 py-1 bg-white/15 rounded-full text-[11px] font-medium text-white backdrop-blur-xs">
                            Akses: {role}
                          </div>
                          {dashboardData?.updatedAt && (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/10 rounded-full text-[10px] font-medium text-white/90">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              <span>Diperbarui: {dashboardData.updatedAt}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Loading State Banner */}
                      {isLoadingDashboard && !dashboardData && (
                        <div className="bg-white p-6 rounded-[22px] border border-slate-100 shadow-xs flex flex-col items-center justify-center text-center space-y-2.5">
                          <RotateCw className="w-6 h-6 text-[#246BFD] animate-spin" />
                          <div>
                            <div className="text-xs font-bold text-[#14263D]">Mengambil data dari Google Sheets...</div>
                            <p className="text-[11px] text-[#64748B] mt-0.5">Memuat ringkasan bahan, produk, supplier, dan riwayat produksi</p>
                          </div>
                        </div>
                      )}

                      {/* Error State with Retry Button */}
                      {dashboardError && (
                        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-[20px] space-y-2">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                            <span className="text-xs font-bold">Gagal Mengambil Data Dashboard</span>
                          </div>
                          <p className="text-[11px] text-rose-700 leading-relaxed">
                            {dashboardError}
                          </p>
                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={() => fetchDashboardData()}
                              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                            >
                              <RotateCw className="w-3.5 h-3.5" />
                              <span>Coba Lagi</span>
                            </button>
                            {dashboardError.toLowerCase().includes('kedaluwarsa') && (
                              <button
                                onClick={handleLogout}
                                className="px-3 py-1.5 bg-white border border-rose-300 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-semibold transition-colors"
                              >
                                Login Ulang
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Summary Section */}
                      <div>
                        <div className="flex items-center justify-between mb-2.5">
                          <h4 className="text-[16px] font-bold text-[#1E293B]">
                            Ringkasan persediaan
                          </h4>
                          <div className="flex items-center gap-1.5">
                            {isLoadingDashboard && (
                              <span className="text-[10px] text-blue-600 font-medium flex items-center gap-1">
                                <RotateCw className="w-3 h-3 animate-spin" />
                                Memperbarui...
                              </span>
                            )}
                            {dashboardData && !isLoadingDashboard && (
                              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                Data Google Sheets
                              </span>
                            )}
                          </div>
                        </div>

                        {/* 4 Cards Grid - 3 clickable cards for Bahan, Produk, Supplier */}
                        <div className="grid grid-cols-2 gap-2.5">
                          {/* Card 1: Bahan Aktif */}
                          <button
                            type="button"
                            onClick={() => { setDashboardSubView('bahan'); setDashboardSubSearch(''); }}
                            className="bg-white p-3.5 rounded-[18px] border border-slate-100 shadow-xs hover:border-blue-300 active:scale-[0.98] transition-all text-left cursor-pointer group"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <FlaskConical className="w-5 h-5 text-[#246BFD]" />
                              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                Buka <ChevronRight className="w-3 h-3" />
                              </span>
                            </div>
                            <div className="text-[23px] font-black text-[#14263D] leading-tight">
                              {bahanAktifValue}
                            </div>
                            <div className="text-[12px] font-semibold text-[#1E293B] mt-0.5">
                              Bahan aktif
                            </div>
                            <div className="text-[10px] text-[#64748B] mt-1 line-clamp-1">
                              {dashboardData ? 'Klik untuk daftar & riwayat stok' : 'Menunggu data server'}
                            </div>
                          </button>

                          {/* Card 2: Produk Aktif */}
                          <button
                            type="button"
                            onClick={() => { setDashboardSubView('produk'); setDashboardSubSearch(''); }}
                            className="bg-white p-3.5 rounded-[18px] border border-slate-100 shadow-xs hover:border-blue-300 active:scale-[0.98] transition-all text-left cursor-pointer group"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <Package className="w-5 h-5 text-[#246BFD]" />
                              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                Buka <ChevronRight className="w-3 h-3" />
                              </span>
                            </div>
                            <div className="text-[23px] font-black text-[#14263D] leading-tight">
                              {produkAktifValue}
                            </div>
                            <div className="text-[12px] font-semibold text-[#1E293B] mt-0.5">
                              Produk aktif
                            </div>
                            <div className="text-[10px] text-[#64748B] mt-1 line-clamp-1">
                              {dashboardData ? 'Klik untuk daftar & transaksi produk' : 'Menunggu data server'}
                            </div>
                          </button>

                          {/* Card 3: Supplier Aktif */}
                          <button
                            type="button"
                            onClick={() => {
                              setDashboardSubView('supplier');
                              setDashboardSubSearch('');
                              if (suppliers.length === 0) loadStockInFormData();
                            }}
                            className="bg-white p-3.5 rounded-[18px] border border-slate-100 shadow-xs hover:border-blue-300 active:scale-[0.98] transition-all text-left cursor-pointer group"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <Truck className="w-5 h-5 text-[#246BFD]" />
                              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                Buka <ChevronRight className="w-3 h-3" />
                              </span>
                            </div>
                            <div className="text-[23px] font-black text-[#14263D] leading-tight">
                              {supplierAktifValue}
                            </div>
                            <div className="text-[12px] font-semibold text-[#1E293B] mt-0.5">
                              Supplier aktif
                            </div>
                            <div className="text-[10px] text-[#64748B] mt-1 line-clamp-1">
                              {dashboardData ? 'Klik untuk daftar & detail supplier' : 'Menunggu data server'}
                            </div>
                          </button>

                          {/* Card 4: Riwayat Produksi */}
                          <div className="bg-white p-3.5 rounded-[18px] border border-slate-100 shadow-xs">
                            <Receipt className="w-5 h-5 text-[#246BFD] mb-2" />
                            <div className="text-[23px] font-black text-[#14263D] leading-tight">
                              {riwayatProduksiCount}
                            </div>
                            <div className="text-[12px] font-semibold text-[#1E293B] mt-0.5">
                              Riwayat produksi
                            </div>
                            <div className="text-[10px] text-[#64748B] mt-1 line-clamp-1">
                              {dashboardData ? 'Batch tercatat di server' : 'Menunggu data server'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Riwayat Produksi Terbaru Section (Up to 5 items) */}
                      <div>
                        <div className="flex items-center justify-between mb-2.5">
                          <h4 className="text-[16px] font-bold text-[#1E293B]">
                            Riwayat produksi terbaru
                          </h4>
                          {Array.isArray(dashboardData?.recentProduction) && dashboardData.recentProduction.length > 0 && (
                            <span className="text-[10px] font-medium text-slate-500">
                              {Math.min(5, dashboardData.recentProduction.length)} dari {dashboardData.recentProduction.length}
                            </span>
                          )}
                        </div>

                        {Array.isArray(dashboardData?.recentProduction) && dashboardData.recentProduction.length > 0 ? (
                          <div className="space-y-2">
                            {dashboardData.recentProduction.slice(0, 5).map((prod, idx) => {
                              const prodName = prod.nama || prod.namaProduk || prod.produk || prod.productName || prod.itemName || `Produksi #${idx + 1}`;
                              const batch = prod.noBatch || prod.batchNo || prod.batch || prod.kode || '';
                              const qty = prod.jumlah || prod.qty || prod.quantity;
                              const unit = prod.satuan || prod.unit || '';
                              const date = prod.tanggal || prod.date || prod.timestamp || '';
                              const pic = prod.operator || prod.pic || prod.penanggungJawab || '';

                              return (
                                <div
                                  key={prod.id || idx}
                                  className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between gap-3"
                                >
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#246BFD] flex items-center justify-center shrink-0">
                                      <Boxes className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-1.5">
                                        <h5 className="text-[12px] font-bold text-[#1E293B]">
                                          {prodName}
                                        </h5>
                                        {batch && (
                                          <span className="text-[9px] font-mono px-1 py-0.2 bg-slate-100 text-slate-600 rounded">
                                            {batch}
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-[10px] text-[#64748B] mt-0.5">
                                        {date && <span>{date}</span>}
                                        {pic && <span> • PIC: {pic}</span>}
                                      </p>
                                    </div>
                                  </div>
                                  {qty !== undefined && (
                                    <div className="text-right shrink-0">
                                      <div className="text-[13px] font-black text-[#14263D]">
                                        +{qty} <span className="text-[10px] font-normal text-slate-500">{unit}</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs text-center text-xs text-[#64748B]">
                            {isLoadingDashboard
                              ? 'Memuat riwayat produksi...'
                              : dashboardData
                              ? 'Belum ada data riwayat produksi pada Google Sheets.'
                              : 'Riwayat produksi akan ditampilkan setelah data server terhubung.'}
                          </div>
                        )}
                      </div>

                      {/* Akses Cepat */}
                      <div>
                        <h4 className="text-[16px] font-bold text-[#1E293B] mb-2.5">
                          Akses cepat
                        </h4>
                        <div className="space-y-2">
                          {/* Quick 1: Stok Masuk */}
                          <button
                            onClick={() => {
                              setTrxType('MASUK');
                              setActiveTab('Transaksi');
                            }}
                            className="w-full bg-white p-3.5 rounded-[16px] border border-slate-100 flex items-center justify-between text-left hover:border-blue-200 transition-colors shadow-xs"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-[#F4F7FB] rounded-[13px] flex items-center justify-center text-[#246BFD]">
                                <Plus className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="text-[13px] font-semibold text-[#1E293B]">
                                  Stok masuk
                                </div>
                                <div className="text-[11px] text-[#64748B]">
                                  Catat penerimaan bahan
                                </div>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          </button>

                          {/* Quick 2: Lihat Persediaan */}
                          <button
                            onClick={() => setActiveTab('Stok')}
                            className="w-full bg-white p-3.5 rounded-[16px] border border-slate-100 flex items-center justify-between text-left hover:border-blue-200 transition-colors shadow-xs"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-[#F4F7FB] rounded-[13px] flex items-center justify-center text-[#246BFD]">
                                <Package className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="text-[13px] font-semibold text-[#1E293B]">
                                  Lihat persediaan
                                </div>
                                <div className="text-[11px] text-[#64748B]">
                                  Periksa saldo stok
                                </div>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          </button>

                          {/* Quick 3: Catatan Penerimaan Bahan */}
                          <button
                            onClick={() => setActiveTab('Catatan Penerimaan')}
                            className="w-full bg-white p-3.5 rounded-[16px] border border-slate-100 flex items-center justify-between text-left hover:border-blue-200 transition-colors shadow-xs"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-[#F4F7FB] rounded-[13px] flex items-center justify-center text-[#246BFD]">
                                <History className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="text-[13px] font-semibold text-[#1E293B]">
                                  Catatan Penerimaan Bahan
                                </div>
                                <div className="text-[11px] text-[#64748B]">
                                  Bahan baku dan bahan pengemas
                                </div>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          </button>
                        </div>
                      </div>

                      {/* Footer notice */}
                      <p className="text-[11px] text-[#64748B] text-center pt-2">
                        {dashboardData
                          ? `Data dashboard diambil langsung dari Google Sheets (Terakhir disinkronkan: ${dashboardData.updatedAt || 'Baru saja'}).`
                          : 'Data ringkasan diambil dari Google Sheets via Google Apps Script API.'}
                      </p>
                    </>
                  )}
                </div>
              )}

                  {/* TAB 2: STOK */}
                  {activeTab === 'Stok' && (
                    <div>
                      {mode === 'starter' ? (
                        /* Exact PlaceholderScreen from MainActivity.kt */
                        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-[#246BFD] mb-4">
                            <Wrench className="w-8 h-8" />
                          </div>
                          <h3 className="text-[21px] font-bold text-[#14263D] mb-2">
                            Stok
                          </h3>
                          <p className="text-[13px] text-[#64748B] max-w-xs leading-relaxed">
                            Menu ini akan kita aktifkan bertahap setelah login dan dashboard selesai.
                          </p>
                          <button
                            onClick={() => setMode('interactive')}
                            className="mt-6 px-4 py-2 bg-[#246BFD] text-white rounded-xl text-xs font-semibold shadow-xs"
                          >
                            Buka Preview Fitur Stok Aktif
                          </button>
                        </div>
                      ) : (
                        /* Interactive Stock View */
                        <div className="space-y-3">
                          <div className="sticky -top-5 -mt-5 -mx-5 p-5 pb-3 bg-[#F4F7FB]/95 backdrop-blur-xs z-10 space-y-2.5 border-b border-slate-200/60 shadow-2xs">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="text-[22px] font-bold text-[#14263D]">
                                  Persediaan Barang
                                </h3>
                                <p className="text-[11px] text-[#64748B]">
                                  {isLoadingInventory ? 'Mengambil data Google Sheets…' : `Total ${inventory.length} item dari Google Sheets`}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => fetchInventoryData()}
                                disabled={isLoadingInventory}
                                aria-label="Muat ulang persediaan"
                                className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#246BFD] disabled:opacity-50"
                              >
                                <RotateCw className={`w-4 h-4 ${isLoadingInventory ? 'animate-spin' : ''}`} />
                              </button>
                            </div>
                            {inventoryUpdatedAt && (
                              <p className="text-[10px] text-emerald-700">Data Google Sheets • Sinkron {new Date(inventoryUpdatedAt).toLocaleString('id-ID')}</p>
                            )}
                            {inventoryError && (
                              <div className="p-3 rounded-xl border border-rose-200 bg-rose-50 text-[11px] text-rose-700">
                                <div className="font-bold mb-1">Gagal memuat persediaan</div>
                                <div>{inventoryError}</div>
                                <button type="button" onClick={() => fetchInventoryData()} className="mt-2 px-3 py-1.5 rounded-lg bg-rose-600 text-white font-semibold">Coba lagi</button>
                              </div>
                            )}

                            {/* Search bar */}
                            <div className="relative">
                              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                              <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Cari nama barang atau SKU..."
                                className="w-full pl-9 pr-8 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#246BFD] shadow-xs"
                              />
                              {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

                            {/* Category pills */}
                            <div className="flex gap-1.5 overflow-x-auto pb-0.5 text-[11px]">
                              {(['Semua', 'Bahan Baku', 'Bahan Kemasan', 'Produk Jadi'] as const).map(cat => (
                                <button
                                  key={cat}
                                  onClick={() => setCategoryFilter(cat)}
                                  className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                                    categoryFilter === cat
                                      ? 'bg-[#14263D] text-white shadow-xs'
                                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                  }`}
                                >
                                  {cat}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Items list */}
                          <div className="space-y-2 pt-1 pb-4">
                            {isLoadingInventory && inventory.length === 0 && (
                              <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center text-xs text-slate-500">Mengambil daftar bahan dan produk dari Google Sheets…</div>
                            )}
                            {!isLoadingInventory && !inventoryError && inventory.length === 0 && (
                              <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center text-xs text-slate-500">Belum ada data persediaan yang diterima dari server.</div>
                            )}
                            {!isLoadingInventory && inventory.length > 0 && filteredInventory.length === 0 && (
                              <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center text-xs text-slate-500">Tidak ada barang yang cocok dengan pencarian atau kategori.</div>
                            )}
                            {filteredInventory.map(item => {
                              const isLow = item.stock !== null && item.stock !== undefined && item.stock <= item.minStock;
                              return (
                                <div
                                  key={item.id}
                                  className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs flex flex-col gap-1.5"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <span className="text-[9px] font-mono font-bold text-[#246BFD] uppercase bg-blue-50 px-1.5 py-0.5 rounded">
                                        {item.sku}
                                      </span>
                                      <h5 className="text-[12px] font-bold text-[#1E293B] mt-0.5">
                                        {item.name}
                                      </h5>
                                      <span className="text-[10px] text-slate-500">
                                        {item.category} • {item.location}
                                      </span>
                                    </div>
                                    <div className="text-right shrink-0">
                                      <div className={`text-[15px] font-black ${isLow ? 'text-amber-600' : 'text-[#14263D]'}`}>
                                        {item.stock === null || item.stock === undefined ? '—' : Number(item.stock).toLocaleString('id-ID')} <span className="text-[11px] font-normal text-slate-500">{item.unit}</span>
                                      </div>
                                      {item.stock === null || item.stock === undefined ? (
                                        <span className="text-[9px] text-rose-500" title={item.stockError || 'Saldo belum tersedia'}>
                                          Saldo belum tersedia
                                        </span>
                                      ) : isLow ? (
                                        <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                                          <AlertTriangle className="w-2.5 h-2.5" /> Stok Tipis
                                        </span>
                                      ) : (
                                        <span className="text-[9px] text-slate-400">
                                          Min: {item.minStock} {item.unit}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}


                  {/* TAB KARTU STOK: detail saldo + riwayat seperti web KJS */}
                  {activeTab === 'Kartu Stok' && (
                    <div className="space-y-3">
                      <div className="sticky -top-5 -mt-5 -mx-5 p-5 pb-3 bg-[#F4F7FB]/95 backdrop-blur-xs z-10 border-b border-slate-200/60">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <h3 className="text-[22px] font-bold text-[#14263D]">Kartu Stok</h3>
                            <p className="text-[11px] text-[#64748B]">Saldo dan riwayat transaksi dari Google Sheets</p>
                          </div>
                          <button type="button" onClick={() => loadMaterialStockCard()} disabled={!stockCardCode || stockCardLoading}
                            className="rounded-xl bg-white border border-slate-200 p-2.5 text-[#246BFD] disabled:opacity-40" aria-label="Muat ulang kartu stok">
                            <RotateCw className={`w-4 h-4 ${stockCardLoading ? 'animate-spin' : ''}`} />
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5 mt-3">
                          <button
                            type="button"
                            onClick={() => { setStockCardCategory('BAHAN BAKU'); setStockCardData(null); setStockCardError(''); setStockCardCode(''); }}
                            className={`rounded-xl px-2 py-2 text-[11px] font-bold transition-all ${stockCardCategory === 'BAHAN BAKU' ? 'bg-[#246BFD] text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'}`}
                          >
                            Bahan Baku
                          </button>
                          <button
                            type="button"
                            onClick={() => { setStockCardCategory('BAHAN PENGEMAS'); setStockCardData(null); setStockCardError(''); setStockCardCode(''); }}
                            className={`rounded-xl px-2 py-2 text-[11px] font-bold transition-all ${stockCardCategory === 'BAHAN PENGEMAS' ? 'bg-[#246BFD] text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'}`}
                          >
                            Bahan Pengemas
                          </button>
                          <button
                            type="button"
                            onClick={() => { setStockCardCategory('PRODUK JADI'); setStockCardData(null); setStockCardError(''); setStockCardCode(''); }}
                            className={`rounded-xl px-2 py-2 text-[11px] font-bold transition-all ${stockCardCategory === 'PRODUK JADI' ? 'bg-[#246BFD] text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'}`}
                          >
                            Produk Jadi
                          </button>
                        </div>
                        <label className="block text-[11px] font-semibold text-slate-600 mt-3 mb-1">
                          {stockCardCategory === 'BAHAN BAKU' ? 'Pilih Bahan Baku' : stockCardCategory === 'BAHAN PENGEMAS' ? 'Pilih Bahan Pengemas' : 'Pilih Produk Jadi'}
                        </label>
                        <select
                          value={stockCardCode}
                          onChange={e => setStockCardCode(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs text-slate-800 focus:outline-none focus:border-[#246BFD]"
                        >
                          <option value="">
                            {stockCardCategory === 'BAHAN BAKU' ? 'Pilih bahan baku...' : stockCardCategory === 'BAHAN PENGEMAS' ? 'Pilih bahan pengemas...' : 'Pilih produk jadi...'}
                          </option>
                          {inventory.filter(item => {
                            const cat = String(item.category || '').toUpperCase();
                            if (stockCardCategory === 'BAHAN BAKU') {
                              return cat.includes('BAHAN BAKU') || cat === 'BAHAN' || (!cat.includes('KEMAS') && !cat.includes('PRODUK'));
                            } else if (stockCardCategory === 'BAHAN PENGEMAS') {
                              return cat.includes('KEMAS') || cat.includes('PENGEMAS');
                            } else {
                              return cat.includes('PRODUK') || cat.includes('JADI');
                            }
                          }).map(item => (
                            <option
                              key={item.id || item.sku}
                              value={stockCardCategory === 'PRODUK JADI' ? item.id : (item.sku || item.id)}
                            >
                              [{item.sku}] {item.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {!stockCardCode ? (
                        <div className="rounded-2xl border border-slate-100 bg-white p-5 text-center text-xs text-slate-500">
                          Pilih {stockCardCategory === 'BAHAN BAKU' ? 'bahan baku' : stockCardCategory === 'BAHAN PENGEMAS' ? 'bahan pengemas' : 'produk jadi'} untuk menampilkan saldo dan riwayat pergerakan stok.
                        </div>
                      ) : stockCardLoading ? (
                        <div className="rounded-2xl border border-slate-100 bg-white p-6 text-center">
                          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#246BFD]" />
                          <p className="text-xs text-slate-500">Memuat riwayat kartu stok dari Google Sheets...</p>
                        </div>
                      ) : stockCardError ? (
                        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
                          <p className="font-bold">Riwayat belum dapat dimuat</p>
                          <p className="mt-1">{stockCardError}</p>
                          <button type="button" onClick={() => loadStockCard()} className="mt-3 rounded-lg bg-rose-600 px-3 py-2 font-bold text-white">Coba lagi</button>
                        </div>
                      ) : stockCardData ? (() => {
                        // Urutkan riwayat transaksi terbaru terlebih dahulu
                        const sorted = [...(stockCardData.transactions || [])].sort((a: any, b: any) => {
                          const dateA = new Date(a.tanggal || a.date || 0).getTime();
                          const dateB = new Date(b.tanggal || b.date || 0).getTime();
                          if (!isNaN(dateA) && !isNaN(dateB) && dateA !== dateB) return dateB - dateA;
                          return (Number(b.sequence || 0)) - (Number(a.sequence || 0));
                        });

                        const rows = sorted.filter((row: any) => {
                          const date = String(row.tanggal || row.date || '').slice(0, 10);
                          const search = stockCardSearch.toLowerCase().trim();
                          const matchesSearch = !search || [row.source, row.jenis, row.batch, row.batchBahan, row.keterangan, row.petugas].some((v: any) => String(v || '').toLowerCase().includes(search));
                          return matchesSearch && (!stockCardDateFrom || date >= stockCardDateFrom) && (!stockCardDateTo || date <= stockCardDateTo);
                        });

                        const totalIn = rows.reduce((sum: number, row: any) => sum + Number(row.stockIn || 0), 0);
                        const totalOut = rows.reduce((sum: number, row: any) => sum + Number(row.stockOut || 0), 0);

                        return (
                          <>
                            <div className="rounded-2xl border border-slate-100 bg-white p-4">
                              <p className="text-[11px] text-slate-500">{stockCardData.nama || 'Barang dipilih'}</p>
                              <div className="mt-1 flex items-end gap-1">
                                <strong className="text-[25px] font-black text-[#14263D]">{Number(stockCardData.currentStock || 0).toLocaleString('id-ID', { maximumFractionDigits: 3 })}</strong>
                                <span className="pb-1 text-[11px] text-slate-500">{stockCardData.satuan || ''}</span>
                              </div>
                              <p className="mt-1 text-[10px] text-slate-400">Saldo saat ini (Google Sheets)</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="rounded-xl border border-slate-100 bg-white p-3">
                                <p className="text-[10px] text-slate-500 uppercase">Total Masuk (Filter)</p>
                                <p className="mt-1 text-sm font-black text-emerald-700">+{totalIn.toLocaleString('id-ID', { maximumFractionDigits: 3 })} {stockCardData.satuan}</p>
                              </div>
                              <div className="rounded-xl border border-slate-100 bg-white p-3">
                                <p className="text-[10px] text-slate-500 uppercase">Total Keluar (Filter)</p>
                                <p className="mt-1 text-sm font-black text-rose-700">−{totalOut.toLocaleString('id-ID', { maximumFractionDigits: 3 })} {stockCardData.satuan}</p>
                              </div>
                            </div>
                            <div className="rounded-2xl border border-slate-100 bg-white p-3 space-y-2">
                              <input
                                value={stockCardSearch}
                                onChange={e => setStockCardSearch(e.target.value)}
                                placeholder="Cari batch, jenis, keterangan, petugas..."
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
                              />
                              {/* Filter Tanggal Mulai dan Tanggal Akhir */}
                              <div className="grid grid-cols-2 gap-2">
                                <label className="text-[10px] font-semibold text-slate-500">
                                  Tanggal Mulai
                                  <input
                                    type="date"
                                    value={stockCardDateFrom}
                                    onChange={e => setStockCardDateFrom(e.target.value)}
                                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-normal"
                                  />
                                </label>
                                <label className="text-[10px] font-semibold text-slate-500">
                                  Tanggal Akhir
                                  <input
                                    type="date"
                                    value={stockCardDateTo}
                                    onChange={e => setStockCardDateTo(e.target.value)}
                                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-normal"
                                  />
                                </label>
                              </div>
                              <div className="flex items-center justify-between pt-1">
                                <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                                  Riwayat Transaksi Terkini ({rows.length})
                                </div>
                                {(stockCardDateFrom || stockCardDateTo || stockCardSearch) && (
                                  <button
                                    type="button"
                                    onClick={() => { setStockCardDateFrom(''); setStockCardDateTo(''); setStockCardSearch(''); }}
                                    className="text-[10px] text-[#246BFD] font-semibold hover:underline"
                                  >
                                    Reset Filter
                                  </button>
                                )}
                              </div>

                              {rows.length ? rows.map((row: any, index: number) => {
                                const isStokMasuk = String(row.source || row.jenis || '').toUpperCase().includes('MASUK');
                                const isBahanBaku = stockCardCategory === 'BAHAN BAKU';
                                // Semua kategori tetap bisa membuka edit detail stok masuk.
                                // Fitur COA hanya tersedia untuk bahan baku.
                                const canOpenDetail = isStokMasuk;
                                const canOpenCoa = isBahanBaku && isStokMasuk;

                                return (
                                  <div
                                    key={`${row.sequence || index}-${row.source || row.jenis}-${row.batch || index}`}
                                    className="border-t border-slate-100 py-3 text-left"
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <span className="text-[11px] font-bold text-slate-800">
                                            {row.source || row.jenis || (Number(row.stockIn || 0) > 0 ? 'Stok Masuk' : 'Stok Keluar')}
                                          </span>
                                          {canOpenDetail && (
                                            <button
                                              type="button"
                                              onClick={() => openStockInDetail(row)}
                                              className="inline-flex items-center gap-0.5 text-[9px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-1.5 py-0.5 rounded border border-blue-200 cursor-pointer"
                                              title={canOpenCoa ? 'Lihat/edit detail stok masuk dan kelola COA bahan baku' : 'Edit detail stok masuk'}
                                            >
                                              <FileText className="w-2.5 h-2.5" />
                                              <span>{canOpenCoa ? 'COA & Detail' : 'EDIT DETAIL'}</span>
                                            </button>
                                          )}
                                        </div>

                                        <p className="mt-1 break-words text-[10px] text-slate-500">
                                          Tanggal: {row.tanggal || row.date || '—'} · No. Batch: <span className="font-mono font-semibold text-slate-700">{row.batch || '—'}</span>
                                        </p>

                                        {row.batchBahan && row.batchBahan !== row.batch && (
                                          <p className="text-[10px] text-slate-500">
                                            Batch bahan: <span className="font-mono">{row.batchBahan}</span>
                                          </p>
                                        )}

                                        {row.expDate && (
                                          <p className="text-[10px] text-slate-500">
                                            Exp: {row.expDate}
                                          </p>
                                        )}

                                        <p className="mt-1 text-[10px] text-slate-600">
                                          Keterangan: {row.keterangan || '—'}
                                        </p>

                                        <p className="text-[10px] text-slate-400">
                                          Petugas: {row.petugas || '—'}
                                        </p>
                                      </div>

                                      <div className="shrink-0 text-right">
                                        {Number(row.stockIn || 0) !== 0 && (
                                          <p className="text-[12px] font-black text-emerald-700">
                                            +{Number(row.stockIn).toLocaleString('id-ID', { maximumFractionDigits: 3 })}
                                          </p>
                                        )}
                                        {Number(row.stockOut || 0) !== 0 && (
                                          <p className="text-[12px] font-black text-rose-700">
                                            −{Number(row.stockOut).toLocaleString('id-ID', { maximumFractionDigits: 3 })}
                                          </p>
                                        )}
                                        <p className="text-[10px] text-slate-400">
                                          {row.satuan || stockCardData.satuan}
                                        </p>

                                        {/* Saldo Transaksi */}
                                        <div className="mt-1 text-[10px] bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 inline-block font-mono text-slate-600">
                                          Saldo: {row.saldo !== undefined && row.saldo !== null
                                            ? Number(row.saldo).toLocaleString('id-ID', { maximumFractionDigits: 3 })
                                            : (row.balance !== undefined
                                              ? Number(row.balance).toLocaleString('id-ID', { maximumFractionDigits: 3 })
                                              : (row.currentStock !== undefined ? Number(row.currentStock).toLocaleString('id-ID', { maximumFractionDigits: 3 }) : '—'))}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              }) : (
                                <p className="py-4 text-center text-xs text-slate-400">
                                  Tidak ada transaksi pada filter ini.
                                </p>
                              )}
                            </div>
                          </>
                        );
                      })() : null}
                    </div>
                  )}

                  {/* TAB 3: TRANSAKSI */}
                  {activeTab === 'Transaksi' && (
                    <div>
                      {mode === 'starter' ? (
                        /* Exact PlaceholderScreen from MainActivity.kt */
                        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-[#246BFD] mb-4">
                            <Wrench className="w-8 h-8" />
                          </div>
                          <h3 className="text-[21px] font-bold text-[#14263D] mb-2">
                            Transaksi
                          </h3>
                          <p className="text-[13px] text-[#64748B] max-w-xs leading-relaxed">
                            Menu ini akan kita aktifkan bertahap setelah login dan dashboard selesai.
                          </p>
                          <button
                            onClick={() => setMode('interactive')}
                            className="mt-6 px-4 py-2 bg-[#246BFD] text-white rounded-xl text-xs font-semibold shadow-xs"
                          >
                            Buka Form Input Transaksi
                          </button>
                        </div>
                      ) : (
                        /* Interactive Transaction Form */
                        <div className="space-y-4">
                          <div className="sticky -top-5 -mt-5 -mx-5 p-5 pb-3 bg-[#F4F7FB]/95 backdrop-blur-xs z-10 border-b border-slate-200/60 shadow-2xs">
                            <h3 className="text-[22px] font-bold text-[#14263D]">
                              Stok Masuk
                            </h3>
                            <p className="text-[11px] text-[#64748B]">
                              Penerimaan bahan masuk langsung ke Google Sheets
                            </p>
                          </div>

                          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-[11px]">
                            Stok masuk bahan baku dan bahan pengemas tersambung ke Google Sheets. COA bisa diunggah saat input atau ditambahkan kemudian.
                          </div>

                          {trxSuccessMessage && (
                            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                              <span>{trxSuccessMessage}</span>
                            </div>
                          )}

                          <form onSubmit={handleAddTransaction} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-3">
                            {/* Pilih Barang */}
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                Pilih Jenis Bahan
                              </label>
                              <div className="grid grid-cols-2 gap-2 mb-2">
                                <button type="button" onClick={() => { setTrxMaterialCategory('BAHAN BAKU'); setSelectedItemId(''); }} className={`rounded-lg py-2 text-[11px] font-bold ${trxMaterialCategory === 'BAHAN BAKU' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>Bahan Baku</button>
                                <button type="button" onClick={() => { setTrxMaterialCategory('BAHAN PENGEMAS'); setSelectedItemId(''); }} className={`rounded-lg py-2 text-[11px] font-bold ${trxMaterialCategory === 'BAHAN PENGEMAS' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>Bahan Pengemas</button>
                              </div>
                              <select
                                value={selectedItemId}
                                onChange={e => { setSelectedItemId(e.target.value); setCoaStatus(''); setCoaExists(false); }}
                                disabled={isLoadingFormData}
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#246BFD]"
                              >
                                {materials.filter(item => String(item.kategori || '').toUpperCase().includes(trxMaterialCategory === 'BAHAN PENGEMAS' ? 'KEMAS' : 'BAKU')).length === 0 ? (
                                  <option value="">{isLoadingFormData ? 'Memuat bahan dari Google Sheets...' : 'Tidak ada bahan aktif'}</option>
                                ) : (
                                  materials.filter(item => String(item.kategori || '').toUpperCase().includes(trxMaterialCategory === 'BAHAN PENGEMAS' ? 'KEMAS' : 'BAKU')).map(item => (
                                    <option key={item.kode} value={item.kode}>[{item.kode}] {item.nama}</option>
                                  ))
                                )}
                              </select>
                              {isLoadingFormData && <p className="text-[10px] text-slate-500 mt-1">Memuat master bahan dan supplier…</p>}
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tanggal Stok Masuk</label>
                              <input type="date" value={trxDate} onChange={e => setTrxDate(e.target.value)} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nomor Batch Supplier</label>
                              <input type="text" value={trxBatch} onChange={e => { setTrxBatch(e.target.value); }} onBlur={() => checkBatchCoa(selectedItemId, trxBatch)} required placeholder="Masukkan nomor batch pada COA/kemasan" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Expired Date</label>
                              <input type="date" value={trxExpiry} onChange={e => setTrxExpiry(e.target.value)} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
                            </div>
                            {/* BIAYA PEMBELIAN: wajib agar backend bisa menghitung nilai persediaan */}
                            <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
                              <p className="text-[11px] font-bold text-blue-800 mb-2">BIAYA PEMBELIAN</p>
                              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Harga Pembelian Total (Rp) *</label>
                              <input type="number" min="1" step="1" value={trxHargaPembelian || ''} onChange={e => setTrxHargaPembelian(Math.max(0, Number(e.target.value) || 0))} required placeholder="Contoh: 500000" className="w-full p-2.5 mb-2 bg-white border border-blue-200 rounded-xl text-xs" />
                              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Ongkos Kirim (Rp)</label>
                              <input type="number" min="0" step="1" value={trxOngkosKirim} onChange={e => setTrxOngkosKirim(Math.max(0, Number(e.target.value) || 0))} placeholder="Isi 0 jika tidak ada" className="w-full p-2.5 bg-white border border-blue-200 rounded-xl text-xs" />
                              <p className="mt-2 text-[10px] font-semibold text-blue-800">Total biaya: Rp {(Number(trxHargaPembelian) + Number(trxOngkosKirim)).toLocaleString('id-ID')}</p>
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Supplier</label>
                              <select value={trxSupplier} onChange={e => setTrxSupplier(e.target.value)} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                                <option value="">Pilih supplier</option>
                                {suppliers.map(supplier => <option key={supplier.kode} value={supplier.kode}>{supplier.nama} ({supplier.kode})</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Status QC</label>
                              <select value={trxQc} onChange={e => setTrxQc(e.target.value)} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                                <option value="LOLOS">LOLOS</option><option value="KARANTINA">KARANTINA</option><option value="DITOLAK">DITOLAK</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-1">COA {trxMaterialCategory === 'BAHAN PENGEMAS' ? 'Bahan Pengemas' : 'Bahan Baku'} (opsional, PDF/JPG/PNG/WEBP maks. 8 MB)</label>
                              <input type="file" accept="application/pdf,image/jpeg,image/png,image/webp" onChange={e => setCoaFile(e.target.files?.[0] || null)} disabled={coaExists} className="w-full text-[10px] file:mr-2 file:rounded-lg file:border file:border-blue-200 file:bg-blue-50 file:px-3 file:py-2 file:font-semibold file:text-blue-800 disabled:opacity-100" />
                              {coaFile && <p className="mt-1 text-[10px] text-slate-600">File dipilih: {coaFile.name}</p>}
                              {coaStatus && <p className={`mt-1 text-[10px] font-semibold ${coaExists ? 'text-emerald-700' : 'text-amber-700'}`}>{coaStatus}</p>}
                              {savedStockInId && coaFile && !coaExists && <button type="button" onClick={uploadCoaToSavedTransaction} disabled={isSavingTransaction} className="mt-2 w-full py-2 rounded-lg bg-blue-600 text-white text-[10px] font-bold disabled:opacity-50">UNGGAH COA KE TRANSAKSI TERSIMPAN</button>}
                              <button type="button" onClick={() => checkBatchCoa(selectedItemId, trxBatch)} className="mt-1 text-[10px] font-semibold text-blue-700 underline">Periksa status COA batch</button>
                            </div>

                            {/* Jumlah & Satuan */}
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                Jumlah ({materials.find(i => i.kode === selectedItemId)?.satuan || 'gram'})
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={trxQty}
                                onChange={e => setTrxQty(Math.max(1, parseInt(e.target.value) || 0))}
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#246BFD]"
                              />
                            </div>

                            {/* PIC / Penanggung Jawab */}
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                Operator / PIC
                              </label>
                              <input
                                type="text"
                                value={trxPic}
                                onChange={e => setTrxPic(e.target.value)}
                                placeholder={`Otomatis: ${userName}`}
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#246BFD]"
                              />
                            </div>

                            {/* Keterangan */}
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                Keterangan / No. PO / No. Batch
                              </label>
                              <input
                                type="text"
                                value={trxNotes}
                                onChange={e => setTrxNotes(e.target.value)}
                                placeholder="Contoh: Batch PO Supplier"
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#246BFD]"
                              />
                            </div>

                            {/* Tombol Simpan Stok Masuk */}
                            <button
                              type="submit"
                              disabled={isSavingTransaction || isLoadingFormData}
                              className="w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50 bg-emerald-600 hover:bg-emerald-700 transition-colors"
                            >
                              <span>{isSavingTransaction ? 'MENYIMPAN…' : 'SIMPAN STOK MASUK'}</span>
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          </form>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 4: RIWAYAT */}
                  {activeTab === 'Stok Keluar' && (
                    <div className="space-y-4">
                      <div className="sticky -top-5 -mt-5 -mx-5 p-5 pb-3 bg-[#F4F7FB]/95 backdrop-blur-xs z-10 border-b border-slate-200/60 shadow-2xs">
                        <h3 className="text-[22px] font-bold text-[#14263D]">Stok Produk Keluar</h3>
                        <p className="text-[11px] text-[#64748B]">Pengeluaran produk jadi berdasarkan batch yang tersedia</p>
                      </div>

                      {productOutError && (
                        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-[11px]">
                          <p>{productOutError}</p>
                          <p className="mt-1 text-rose-700">Periksa kembali koneksi dan deployment Apps Script, lalu coba muat data produk lagi.</p>
                          <button type="button" onClick={() => productOutProductId && loadProductOutAvailability(productOutProductId)} className="mt-2 rounded-lg bg-rose-600 px-3 py-1.5 font-bold text-white">Coba lagi</button>
                        </div>
                      )}
                      {productOutNotice && (
                        <div className={`p-3 rounded-xl border text-xs ${productOutNotice.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                          <div className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /><span>{productOutNotice.message}</span></div>
                        </div>
                      )}

                      <form onSubmit={handleSaveProductOut} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tanggal</label>
                          <input type="date" value={productOutDate} onChange={event => setProductOutDate(event.target.value)} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Produk</label>
                          <select value={productOutProductId} onChange={event => loadProductOutAvailability(event.target.value)} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                            <option value="">Pilih produk</option>
                            {inventory.filter(item => item.category === 'Produk Jadi').map(item => {
                              const idParts = String(item.id).split(':');
                              const code = item.id.startsWith('PRODUK:') ? idParts[1] : item.sku;
                              const packaging = item.id.startsWith('PRODUK:') ? idParts.slice(2).join(':') : '';
                              return <option key={item.id} value={item.id}>{code} - {item.name}{packaging ? ` — ${packaging}` : ''}</option>;
                            })}
                          </select>
                          {!isLoadingInventory && inventory.filter(item => item.category === 'Produk Jadi').length === 0 && <p className="mt-1 text-[10px] text-amber-700">Produk jadi belum termuat. Periksa koneksi/API, lalu muat ulang persediaan.</p>}
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Batch</label>
                          <select value={productOutBatch} onChange={event => { setProductOutBatch(event.target.value); setProductOutQty(''); }} disabled={!productOutProductId || productOutLoading || productOutBatches.length === 0} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs disabled:text-slate-400">
                            <option value="">{productOutLoading ? 'Memuat batch…' : productOutProductId ? (productOutBatches.length ? 'Pilih batch tersedia' : 'Tidak ada batch yang masih tersedia') : 'Pilih produk terlebih dahulu'}</option>
                            {productOutBatches.map(batch => <option key={batch.batch} value={batch.batch}>{batch.batch} — Stok {batch.stok.toLocaleString('id-ID')} PCS</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Qty</label>
                          <input type="number" min="1" max={productOutBatches.find(batch => batch.batch === productOutBatch)?.stok || undefined} step="1" value={productOutQty} onChange={event => setProductOutQty(event.target.value)} required placeholder="Masukkan jumlah" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tujuan</label>
                          <input type="text" value={productOutTujuan} onChange={event => setProductOutTujuan(event.target.value)} placeholder="Reseller JP" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Keterangan</label>
                          <input type="text" value={productOutNotes} onChange={event => setProductOutNotes(event.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
                        </div>
                        {(productOutTotalStock !== null || productOutBatch) && (
                          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                            <p className="text-[10px] text-slate-500">{productOutBatch ? 'Stok batch tersedia' : 'Stok total tersedia'}</p>
                            <p className="text-lg font-black text-[#14263D]">{(productOutBatch ? productOutBatches.find(batch => batch.batch === productOutBatch)?.stok : productOutTotalStock ?? 0)?.toLocaleString('id-ID') || 0} PCS</p>
                            {productOutBatch && productOutTotalStock !== null && <p className="text-[10px] text-slate-500">Total seluruh batch: {productOutTotalStock.toLocaleString('id-ID')} PCS</p>}
                          </div>
                        )}
                        <div className="flex gap-2 pt-1">
                          <button type="button" onClick={() => { setProductOutProductId(''); setProductOutBatch(''); setProductOutBatches([]); setProductOutTotalStock(null); setProductOutQty(''); setProductOutNotes(''); setProductOutError(''); setProductOutNotice(null); }} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">Reset</button>
                          <button type="submit" disabled={productOutSaving || productOutLoading || !productOutBatch} className="flex-1 py-2.5 rounded-xl bg-[#14263D] text-white text-xs font-bold disabled:opacity-50">{productOutSaving ? 'MENYIMPAN…' : 'SIMPAN'}</button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* CATATAN PENERIMAAN BAHAN */}
                  {activeTab === 'Catatan Penerimaan' && (
                    <div className="space-y-3.5">
                      <div className="sticky -top-5 -mt-5 -mx-5 p-5 pb-3 bg-[#F4F7FB]/95 backdrop-blur-xs z-10 border-b border-slate-200/60 shadow-2xs">
                        <h3 className="text-[22px] font-bold text-[#14263D]">Catatan Penerimaan Bahan</h3>
                        <p className="text-[11px] text-[#64748B]">Riwayat penerimaan bahan dari Google Sheets</p>
                      </div>

                      <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-xs space-y-3">
                        <label className="block text-[11px] font-bold text-slate-700">Tampilkan kategori</label>
                        <div className="grid grid-cols-2 gap-2">
                          {(['BAHAN BAKU', 'BAHAN PENGEMAS'] as const).map(category => (
                            <button key={category} type="button" onClick={() => { setReceiptCategory(category); setReceiptSupplierFilter('Semua supplier'); setReceiptQcFilter('Semua QC'); }} className={`rounded-xl px-3 py-2.5 text-[11px] font-bold transition-colors ${receiptCategory === category ? 'bg-[#246BFD] text-white' : 'bg-slate-100 text-slate-700'}`}>
                              {category === 'BAHAN BAKU' ? 'Bahan Baku' : 'Bahan Pengemas'}
                            </button>
                          ))}
                        </div>
                        <label className="relative block">
                          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input value={receiptSearch} onChange={event => setReceiptSearch(event.target.value)} placeholder="Cari kode, nama, batch, supplier, petugas..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-400" />
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <label className="text-[10px] font-semibold text-slate-600">Dari tanggal<input type="date" value={receiptDateFrom} onChange={event => setReceiptDateFrom(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800" /></label>
                          <label className="text-[10px] font-semibold text-slate-600">Sampai tanggal<input type="date" value={receiptDateTo} onChange={event => setReceiptDateTo(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800" /></label>
                          <label className="text-[10px] font-semibold text-slate-600">Status QC<select value={receiptQcFilter} onChange={event => setReceiptQcFilter(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800"><option>Semua QC</option>{receiptQcStatuses.map(status => <option key={status}>{status}</option>)}</select></label>
                          <label className="text-[10px] font-semibold text-slate-600">Supplier<select value={receiptSupplierFilter} onChange={event => setReceiptSupplierFilter(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800"><option>Semua supplier</option>{receiptSuppliers.map(supplier => <option key={supplier}>{supplier}</option>)}</select></label>
                        </div>
                        <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                          <div><p className="text-xs font-bold text-slate-800">{visibleReceiptRecords.length} transaksi ditampilkan</p><p className="text-[10px] text-slate-500">Total qty: {receiptTotalQty.toLocaleString('id-ID', { maximumFractionDigits: 3 })}</p></div>
                          <button type="button" onClick={() => loadReceiptRecords()} disabled={receiptLoading} className="rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-bold text-slate-700 disabled:opacity-50">{receiptLoading ? 'Memuat…' : 'Muat Ulang'}</button>
                        </div>
                      </div>

                      {receiptError && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{receiptError}</div>}
                      {receiptLoading ? (
                        <div className="rounded-xl bg-white p-8 text-center text-xs text-slate-500">Memuat catatan penerimaan...</div>
                      ) : visibleReceiptRecords.length ? (
                        <div className="space-y-2 pb-4">
                          {visibleReceiptRecords.map(row => (
                            <article key={row.id} className="rounded-2xl border border-slate-100 bg-white p-3 shadow-xs">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0"><p className="text-[12px] font-bold text-[#1E293B]">{row.namaBahan || row.kodeBahan || 'Bahan'}</p><p className="mt-0.5 font-mono text-[10px] text-slate-500">{row.kodeBahan} {row.batch ? `• Batch ${row.batch}` : ''}</p></div>
                                <div className="shrink-0 text-right"><p className="text-[13px] font-black text-emerald-700">{Number(row.qty || 0).toLocaleString('id-ID', { maximumFractionDigits: 3 })} {row.satuan}</p><p className="text-[10px] text-slate-500">{row.tanggal || '—'}</p></div>
                              </div>
                              <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-slate-100 pt-2 text-[10px]">
                                <div><span className="text-slate-400">Expired date</span><p className="font-semibold text-slate-700">{row.expiredDate || '—'}</p></div>
                                <div><span className="text-slate-400">Supplier</span><p className="font-semibold text-slate-700">{row.supplier || '—'}</p></div>
                                <div><span className="text-slate-400">Status QC</span><p className="font-semibold text-slate-700">{row.qc || '—'}</p></div>
                                <div><span className="text-slate-400">Petugas</span><p className="font-semibold text-slate-700">{row.petugas || '—'}</p></div>
                              </div>
                            </article>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-xl border border-slate-100 bg-white p-6 text-center text-xs text-slate-500">{receiptRecords.length ? 'Tidak ada transaksi yang sesuai filter.' : 'Belum ada catatan penerimaan untuk kategori ini.'}</div>
                      )}
                    </div>
                  )}

                  {/* TAB 5: AKUN */}
                  {activeTab === 'Akun' && (
                    <div className="space-y-4">
                      <div className="sticky -top-5 -mt-5 -mx-5 p-5 pb-3 bg-[#F4F7FB]/95 backdrop-blur-xs z-10 border-b border-slate-200/60 shadow-2xs">
                        <h2 className="text-[25px] font-black text-[#14263D]">
                          Akun
                        </h2>
                      </div>

                      {/* Account Card */}
                      <div className="bg-white rounded-[20px] p-4.5 border border-slate-100 shadow-xs flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-[#246BFD]">
                          <User className="w-7 h-7" />
                        </div>
                        <div>
                          <h4 className="text-[16px] font-bold text-[#1E293B]">
                            {userName}
                          </h4>
                          <span className="inline-block mt-0.5 px-2 py-0.5 bg-slate-100 text-slate-700 text-[11px] font-semibold rounded-md">
                            Hak Akses: {role}
                          </span>
                        </div>
                      </div>

                      <div className="rounded-[20px] border border-slate-100 bg-white p-4 shadow-xs">
                        <h3 className="text-sm font-bold text-[#1E293B]">Tema tampilan</h3>
                        <p className="mt-1 text-xs text-slate-500">Pilih tampilan yang nyaman digunakan.</p>
                        <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
                          <button type="button" onClick={() => setTheme('light')} className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition-colors ${theme === 'light' ? 'bg-white text-[#1877F2] shadow-sm' : 'text-slate-600'}`}>
                            <Sun className="h-4 w-4" /> Terang
                          </button>
                          <button type="button" onClick={() => setTheme('dark')} className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition-colors ${theme === 'dark' ? 'bg-[#1E293B] text-white shadow-sm' : 'text-slate-600'}`}>
                            <Moon className="h-4 w-4" /> Gelap
                          </button>
                        </div>
                      </div>

                      {/* App & System Details */}
                      <div className="bg-white rounded-[20px] p-4 border border-slate-100 space-y-2 text-xs">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Informasi Sistem
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-500">Perusahaan</span>
                          <span className="font-semibold text-slate-800">PT Kilau Jaya Sejahtera</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-500">Versi Android</span>
                          <span className="font-semibold font-mono text-slate-800">0.1.0 (Build 1)</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-500">Package</span>
                          <span className="font-mono text-[10px] text-slate-800">com.kjs.inventory</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-500">Koneksi Server</span>
                          <span className="font-semibold text-amber-600">
                            {mode === 'starter' ? 'Belum terhubung (Demo)' : 'Simulasi Interaktif'}
                          </span>
                        </div>
                      </div>

                      {/* Logout Button */}
                      <button
                        onClick={handleLogout}
                        className="w-full h-[50px] border border-slate-300 hover:border-rose-400 hover:text-rose-600 hover:bg-rose-50 text-slate-700 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all mt-4"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Keluar</span>
                      </button>
                    </div>
                  )}
                </div>

                {stockInDetailOpen && (
                  <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3">
                    <div className="flex max-h-[92%] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                      <div className="flex items-center justify-between border-b border-slate-100 p-4">
                        <div><h3 className="text-base font-black text-[#14263D]">Detail Stok Masuk</h3><p className="text-[10px] text-slate-500">Edit data penerimaan dan kelola COA susulan</p></div>
                        <button type="button" onClick={closeStockInDetailModal} className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 transition-colors" aria-label="Tutup"><X className="h-4 w-4" /></button>
                      </div>
                      <div className="space-y-3 overflow-y-auto p-4">
                        {stockInDetailLoading ? <div className="py-10 text-center"><div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"/><p className="text-xs text-slate-500">Memuat detail transaksi...</p></div> : stockInEdit ? <>
                          <div className="rounded-xl bg-blue-50 p-3 text-xs"><p className="font-bold text-blue-900">{stockInEdit.bahan || stockInEdit.namaBahan || stockInEdit.kodeBahan}</p><p className="mt-1 text-blue-700">ID transaksi: {stockInEdit.id}</p></div>
                          <label className="block text-[11px] font-semibold text-slate-600">Tanggal stok masuk<input type="date" value={String(stockInEdit.tanggal || '').slice(0,10)} onChange={e=>setStockInEdit({...stockInEdit,tanggal:e.target.value})} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-xs" /></label>
                          <label className="block text-[11px] font-semibold text-slate-600">Batch supplier<input value={stockInEdit.batch || ''} onChange={e=>setStockInEdit({...stockInEdit,batch:e.target.value})} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-xs" /></label>
                          <label className="block text-[11px] font-semibold text-slate-600">Expired date<input type="date" value={String(stockInEdit.expiredDate || '').slice(0,10)} onChange={e=>setStockInEdit({...stockInEdit,expiredDate:e.target.value})} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-xs" /></label>
                          <label className="block text-[11px] font-semibold text-slate-600">Jumlah ({stockInEdit.satuan || 'satuan'})<input type="number" min="0.001" step="any" value={stockInEdit.qty ?? ''} onChange={e=>setStockInEdit({...stockInEdit,qty:e.target.value})} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-xs" /></label>
                          <label className="block text-[11px] font-semibold text-slate-600">Harga pembelian (Rp)<input type="number" min="1" step="1" value={stockInEdit.hargaPembelian ?? ''} onChange={e=>setStockInEdit({...stockInEdit,hargaPembelian:e.target.value})} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-xs" /></label>
                          <label className="block text-[11px] font-semibold text-slate-600">Ongkos kirim (Rp)<input type="number" min="0" step="1" value={stockInEdit.ongkosKirim ?? 0} onChange={e=>setStockInEdit({...stockInEdit,ongkosKirim:e.target.value})} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-xs" /></label>
                          <label className="block text-[11px] font-semibold text-slate-600">Status QC<select value={stockInEdit.qc || 'LOLOS'} onChange={e=>setStockInEdit({...stockInEdit,qc:e.target.value})} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-xs"><option>LOLOS</option><option>KARANTINA</option><option>DITOLAK</option></select></label>
                          <button type="button" onClick={saveStockInDetailEdit} disabled={stockInDetailSaving} className="w-full rounded-xl bg-blue-600 p-3 text-xs font-bold text-white disabled:opacity-50 hover:bg-blue-700 transition-colors">{stockInDetailSaving ? 'MENYIMPAN...' : 'SIMPAN PERUBAHAN'}</button>
                          {stockCardCategory === 'BAHAN BAKU' && (
                            <div className="rounded-xl border border-slate-200 p-3">
                              <p className="text-xs font-bold text-slate-800">Dokumen COA (Bahan Baku)</p>
                              {stockInDocuments.filter((d:any)=>String(d.jenisDokumen || d['Jenis Dokumen'] || d.type || 'COA').toUpperCase()==='COA').length ? stockInDocuments.filter((d:any)=>String(d.jenisDokumen || d['Jenis Dokumen'] || d.type || 'COA').toUpperCase()==='COA').map((doc:any,i:number)=><a key={i} href={doc.urlFile || doc['URL File'] || doc.url} target="_blank" rel="noreferrer" className="mt-2 block break-all text-[11px] font-semibold text-blue-700 underline">{doc.namaFile || doc['Nama File'] || 'Buka COA tersimpan'}</a>) : <p className="mt-1 text-[11px] text-amber-700">COA belum tersedia untuk transaksi ini.</p>}
                              <label className="mt-3 block text-[10px] font-semibold text-slate-600">Unggah COA susulan (PDF/JPG/PNG/WEBP, maks. 8 MB)<input type="file" accept="application/pdf,image/jpeg,image/png,image/webp" onChange={e=>setStockInCoaFile(e.target.files?.[0] || null)} className="mt-2 w-full text-[10px]" /></label>
                              {stockInCoaFile && <p className="mt-1 break-all text-[10px] text-slate-500">Dipilih: {stockInCoaFile.name}</p>}
                              <button type="button" onClick={uploadCoaForExistingStockIn} disabled={stockInDetailSaving || !stockInCoaFile} className="mt-2 w-full rounded-xl bg-emerald-600 p-3 text-xs font-bold text-white disabled:opacity-50 hover:bg-emerald-700 transition-colors">{stockInDetailSaving ? 'MEMPROSES...' : 'UNGGAH COA'}</button>
                            </div>
                          )}
                        </> : <p className="py-6 text-center text-xs text-slate-500">Detail transaksi tidak tersedia.</p>}

                      </div>
                    </div>
                  </div>
                )}

                {/* Modal Riwayat Pergerakan Stok / Transaksi dari Dashboard */}
                {selectedDashboardItemHistory && (
                  <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3">
                    <div className="flex max-h-[92%] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                      <div className="flex items-center justify-between border-b border-slate-100 p-4">
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                              {selectedDashboardItemHistory.item.sku}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500">
                              {selectedDashboardItemHistory.category === 'BAHAN BAKU' ? 'Bahan Baku' : selectedDashboardItemHistory.category === 'BAHAN PENGEMAS' ? 'Bahan Pengemas' : 'Produk Jadi'}
                            </span>
                          </div>
                          <h3 className="text-base font-black text-[#14263D] truncate mt-0.5">
                            {selectedDashboardItemHistory.item.name}
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedDashboardItemHistory(null)}
                          className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 shrink-0"
                          aria-label="Tutup"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="space-y-3 overflow-y-auto p-4">
                        {/* Current Stock Banner */}
                        <div className="rounded-xl bg-blue-50/80 p-3 flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Saldo Stok Aktual</p>
                            <p className="text-[18px] font-black text-[#14263D]">
                              {selectedDashboardItemHistory.item.stock !== null && selectedDashboardItemHistory.item.stock !== undefined
                                ? Number(selectedDashboardItemHistory.item.stock).toLocaleString('id-ID', { maximumFractionDigits: 3 })
                                : '0'}{' '}
                              <span className="text-xs font-normal text-slate-600">{selectedDashboardItemHistory.item.unit}</span>
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setStockCardCategory(selectedDashboardItemHistory.category);
                              setStockCardCode(selectedDashboardItemHistory.item.sku);
                              setActiveTab('Kartu Stok');
                              setSelectedDashboardItemHistory(null);
                              setDashboardSubView(null);
                            }}
                            className="px-3 py-2 bg-[#246BFD] text-white text-[11px] font-bold rounded-xl shadow-xs hover:bg-blue-700 transition-colors"
                          >
                            Buka Kartu Stok ›
                          </button>
                        </div>

                        {/* Transactions list header */}
                        <div className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                          <span>Riwayat Transaksi (Google Sheets)</span>
                          {stockCardData?.transactions && (
                            <span className="text-[10px] text-slate-400 font-normal">
                              {stockCardData.transactions.length} transaksi
                            </span>
                          )}
                        </div>

                        {stockCardLoading ? (
                          <div className="py-8 text-center">
                            <div className="mx-auto mb-2 h-7 w-7 animate-spin rounded-full border-4 border-slate-200 border-t-[#246BFD]" />
                            <p className="text-xs text-slate-500">Mengambil riwayat mutasi dari Google Sheets...</p>
                          </div>
                        ) : stockCardError ? (
                          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                            <p className="font-bold">Gagal memuat riwayat:</p>
                            <p className="mt-1">{stockCardError}</p>
                            <button
                              type="button"
                              onClick={() => loadStockCard(selectedDashboardItemHistory.item.sku, selectedDashboardItemHistory.category)}
                              className="mt-2 px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold"
                            >
                              Coba lagi
                            </button>
                          </div>
                        ) : (stockCardData?.transactions && stockCardData.transactions.length > 0) ? (
                          <div className="space-y-2">
                            {stockCardData.transactions.slice(0, 20).map((row: any, i: number) => (
                              <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <span className="font-bold text-slate-800">
                                      {row.source || row.jenis || (Number(row.stockIn || 0) > 0 ? 'Stok Masuk' : 'Stok Keluar')}
                                    </span>
                                    <p className="text-[10px] text-slate-500 mt-0.5">
                                      Tanggal: {row.tanggal || row.date || '—'} · No. Batch: <span className="font-mono text-slate-700">{row.batch || '—'}</span>
                                    </p>
                                    {row.batchBahan && row.batchBahan !== row.batch && (
                                      <p className="text-[10px] text-slate-500">Batch bahan: {row.batchBahan}</p>
                                    )}
                                    {row.keterangan && <p className="text-[10px] text-slate-600 mt-0.5">Ket: {row.keterangan}</p>}
                                    {row.petugas && <p className="text-[10px] text-slate-400">Petugas: {row.petugas}</p>}
                                  </div>
                                  <div className="text-right shrink-0">
                                    {Number(row.stockIn || 0) !== 0 && (
                                      <p className="font-black text-emerald-700">+{Number(row.stockIn).toLocaleString('id-ID')} {row.satuan || selectedDashboardItemHistory.item.unit}</p>
                                    )}
                                    {Number(row.stockOut || 0) !== 0 && (
                                      <p className="font-black text-rose-700">−{Number(row.stockOut).toLocaleString('id-ID')} {row.satuan || selectedDashboardItemHistory.item.unit}</p>
                                    )}
                                    {(row.saldo !== undefined && row.saldo !== null) && (
                                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">Saldo: {Number(row.saldo).toLocaleString('id-ID')}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
                            Belum ada catatan mutasi transaksi pada sheet untuk barang ini.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Modal Detail Supplier dari Dashboard */}
                {selectedSupplierDetail && (
                  <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3">
                    <div className="flex max-h-[90%] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                      <div className="flex items-center justify-between border-b border-slate-100 p-4">
                        <div>
                          <span className="text-[10px] font-mono font-bold bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded">
                            {selectedSupplierDetail.kode}
                          </span>
                          <h3 className="text-base font-black text-[#14263D] mt-1">
                            {selectedSupplierDetail.nama}
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedSupplierDetail(null)}
                          className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 shrink-0"
                          aria-label="Tutup"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="space-y-3 overflow-y-auto p-4 text-xs">
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2.5">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Nama Mitra Pemasok</span>
                            <p className="font-bold text-slate-800 text-[13px]">{selectedSupplierDetail.nama}</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Kode Supplier</span>
                            <p className="font-mono text-slate-700">{selectedSupplierDetail.kode}</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Kontak / Telepon</span>
                            <p className="text-slate-800">{selectedSupplierDetail.telepon || selectedSupplierDetail.kontak || '—'}</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Penanggung Jawab (PIC)</span>
                            <p className="text-slate-800">{selectedSupplierDetail.pic || '—'}</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Alamat</span>
                            <p className="text-slate-700 leading-relaxed">{selectedSupplierDetail.alamat || 'Alamat belum tercatat di Google Sheets'}</p>
                          </div>
                          {selectedSupplierDetail.keterangan && (
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Keterangan</span>
                              <p className="text-slate-600">{selectedSupplierDetail.keterangan}</p>
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedSupplierDetail(null)}
                          className="w-full py-2.5 rounded-xl bg-[#14263D] text-white font-bold text-xs hover:bg-slate-800 transition-colors"
                        >
                          Tutup Detail
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bottom Navigation Bar (Docked at the bottom, outside scroll area) */}
                <div className="shrink-0 bg-white border-t border-slate-200/80 py-2 px-2 flex justify-around items-center z-20 shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
                  {[
                    { label: 'Beranda' as const, icon: Home },
                    { label: 'Stok Masuk Bahan' as const, tab: 'Transaksi' as const, icon: ArrowDownLeft },
                    { label: 'Stok Keluar Produk' as const, tab: 'Stok Keluar' as const, icon: ArrowUpRight },
                    { label: 'Kartu Stok' as const, icon: Receipt },
                    { label: 'Akun' as const, icon: User }
                  ].map(tab => {
                    const IconComp = tab.icon;
                    const isActive = activeTab === ((tab as any).tab || tab.label);
                    return (
                      <button
                        key={tab.label}
                        onClick={() => setActiveTab(((tab as any).tab || tab.label) as any)}
                        className={`flex min-w-0 flex-1 flex-col items-center gap-1 py-1 px-1.5 rounded-xl transition-all ${
                          isActive
                            ? 'text-[#246BFD] font-bold'
                            : 'text-slate-400 hover:text-slate-600 font-medium'
                        }`}
                      >
                        <IconComp className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                        <span className="whitespace-nowrap text-[8px] tracking-tight">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Android Home Navigation Gesture Bar */}
            <div className={`h-4 w-full flex items-center justify-center pb-1 shrink-0 ${isLoggedIn ? 'bg-white' : 'bg-[#F4F7FB]'}`}>
              <div className="w-24 h-1 bg-slate-300 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
