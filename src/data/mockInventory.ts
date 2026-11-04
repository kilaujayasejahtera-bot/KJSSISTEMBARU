export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: 'Bahan Baku' | 'Bahan Kemasan' | 'Produk Jadi';
  stock: number;
  minStock: number;
  unit: string;
  location: string;
  lastUpdated: string;
}

export interface InventoryTransaction {
  id: string;
  date: string;
  type: 'MASUK' | 'KELUAR';
  itemId: string;
  itemName: string;
  category: string;
  quantity: number;
  unit: string;
  pic: string;
  notes: string;
}

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'item-1',
    sku: 'BB-CRN-01',
    name: 'Carnauba Wax Premium Flakes',
    category: 'Bahan Baku',
    stock: 45,
    minStock: 50,
    unit: 'Kg',
    location: 'Gudang Kimia A-02',
    lastUpdated: '2026-10-28 14:30'
  },
  {
    id: 'item-2',
    sku: 'BB-POL-04',
    name: 'Polydimethylsiloxane (PDMS 350cSt)',
    category: 'Bahan Baku',
    stock: 180,
    minStock: 80,
    unit: 'Liter',
    location: 'Gudang Kimia B-01',
    lastUpdated: '2026-10-28 11:15'
  },
  {
    id: 'item-3',
    sku: 'BB-SUR-02',
    name: 'Nonylphenol Ethoxylate (NP-9)',
    category: 'Bahan Baku',
    stock: 15,
    minStock: 40,
    unit: 'Kg',
    location: 'Gudang Kimia A-05',
    lastUpdated: '2026-10-27 16:45'
  },
  {
    id: 'item-4',
    sku: 'BB-WTR-01',
    name: 'Deionized Water (DI Water)',
    category: 'Bahan Baku',
    stock: 1200,
    minStock: 500,
    unit: 'Liter',
    location: 'Tangki Utama T-1',
    lastUpdated: '2026-10-28 09:00'
  },
  {
    id: 'item-5',
    sku: 'KM-BTL-250',
    name: 'Botol HDPE Doff 250ml + Cap',
    category: 'Bahan Kemasan',
    stock: 850,
    minStock: 300,
    unit: 'Pcs',
    location: 'Rak Kemasan C-03',
    lastUpdated: '2026-10-28 15:20'
  },
  {
    id: 'item-6',
    sku: 'KM-JRG-5L',
    name: 'Jerigen Putih Tebal 5 Liter',
    category: 'Bahan Kemasan',
    stock: 75,
    minStock: 100,
    unit: 'Pcs',
    location: 'Rak Kemasan C-08',
    lastUpdated: '2026-10-27 10:00'
  },
  {
    id: 'item-7',
    sku: 'KM-LBL-CW',
    name: 'Stiker Hologram Label KJS Gloss',
    category: 'Bahan Kemasan',
    stock: 2400,
    minStock: 1000,
    unit: 'Lembar',
    location: 'Lemari Label L-01',
    lastUpdated: '2026-10-26 13:40'
  },
  {
    id: 'item-8',
    sku: 'PJ-CWX-250',
    name: 'KJS Ultra Gloss Carnauba Wax 250ml',
    category: 'Produk Jadi',
    stock: 320,
    minStock: 150,
    unit: 'Botol',
    location: 'Gudang Produk Jadi D-01',
    lastUpdated: '2026-10-28 16:10'
  },
  {
    id: 'item-9',
    sku: 'PJ-CMR-500',
    name: 'KJS Nano Ceramic Spray 500ml',
    category: 'Produk Jadi',
    stock: 42,
    minStock: 80,
    unit: 'Botol',
    location: 'Gudang Produk Jadi D-02',
    lastUpdated: '2026-10-28 13:50'
  },
  {
    id: 'item-10',
    sku: 'PJ-SHM-5L',
    name: 'KJS Car Wash Snow Shampoo 5L',
    category: 'Produk Jadi',
    stock: 140,
    minStock: 50,
    unit: 'Jerigen',
    location: 'Gudang Produk Jadi D-05',
    lastUpdated: '2026-10-28 08:30'
  }
];

export const INITIAL_TRANSACTIONS: InventoryTransaction[] = [
  {
    id: 'trx-101',
    date: '2026-10-28 16:10',
    type: 'MASUK',
    itemId: 'item-8',
    itemName: 'KJS Ultra Gloss Carnauba Wax 250ml',
    category: 'Produk Jadi',
    quantity: 120,
    unit: 'Botol',
    pic: 'Rian (Produksi)',
    notes: 'Hasil produksi batch #B-2026-104'
  },
  {
    id: 'trx-102',
    date: '2026-10-28 14:15',
    type: 'KELUAR',
    itemId: 'item-1',
    itemName: 'Carnauba Wax Premium Flakes',
    category: 'Bahan Baku',
    quantity: 25,
    unit: 'Kg',
    pic: 'Budi (Operator)',
    notes: 'Pemakaian formulasi batch #B-2026-104'
  },
  {
    id: 'trx-103',
    date: '2026-10-28 11:30',
    type: 'MASUK',
    itemId: 'item-5',
    itemName: 'Botol HDPE Doff 250ml + Cap',
    category: 'Bahan Kemasan',
    quantity: 500,
    unit: 'Pcs',
    pic: 'Admin KJS',
    notes: 'Penerimaan PO #PO-8812 dari CV Plastindo'
  },
  {
    id: 'trx-104',
    date: '2026-10-28 09:40',
    type: 'KELUAR',
    itemId: 'item-9',
    itemName: 'KJS Nano Ceramic Spray 500ml',
    category: 'Produk Jadi',
    quantity: 38,
    unit: 'Botol',
    pic: 'Siti (Gudang)',
    notes: 'Pengiriman pesanan Distributor Jawa Barat'
  },
  {
    id: 'trx-105',
    date: '2026-10-27 15:00',
    type: 'MASUK',
    itemId: 'item-2',
    itemName: 'Polydimethylsiloxane (PDMS 350cSt)',
    category: 'Bahan Baku',
    quantity: 100,
    unit: 'Liter',
    pic: 'Admin KJS',
    notes: 'Restock bahan pelumas kimia sintetis'
  }
];
