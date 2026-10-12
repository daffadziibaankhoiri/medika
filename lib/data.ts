export const medicines = [
  { name: 'Amoxicillin 500mg', category: 'Antibiotik', stock: 24, expiry: '12 Apr 2026', status: 'Kadaluwarsa', tone: 'danger', price: 18000 },
  { name: 'Paracetamol 500mg', category: 'Analgesik', stock: 156, expiry: '28 Nov 2026', status: 'Aman', tone: 'safe', price: 8500 },
  { name: 'Cetirizine 10mg', category: 'Antialergi', stock: 18, expiry: '03 Jun 2026', status: 'Segera', tone: 'warning', price: 12000 },
  { name: 'Omeprazole 20mg', category: 'Lambung', stock: 82, expiry: '16 Jan 2026', status: 'Aman', tone: 'safe', price: 14500 },
  { name: 'Vitamin C 500mg', category: 'Vitamin', stock: 42, expiry: '21 Mei 2026', status: 'Segera', tone: 'warning', price: 22000 },
]
export const categories = ['Antibiotik', 'Analgesik', 'Antialergi', 'Lambung', 'Vitamin']
export type Supplier = {
  name: string
  contact: string
  address: string
  orders: number
  value: string
}

export const suppliers: Supplier[] = [
  { name: 'PT Sehat Farma', contact: '021-555-0182', address: 'Jakarta Selatan', orders: 12, value: 'Rp 24.850.000' },
  { name: 'CV Medika Jaya', contact: '0812-8901-2234', address: 'Bandung', orders: 8, value: 'Rp 15.420.000' },
  { name: 'Distributor Kimia Farma', contact: '021-700-2200', address: 'Jakarta Pusat', orders: 6, value: 'Rp 9.840.000' },
]
export const money = (value: number) => `Rp ${value.toLocaleString('id-ID')}`

/**
 * Harga pokok (harga modal / HPP) per obat.
 * Sengaja dipisah dari `medicines` supaya kolom ini hanya bisa ditampilkan
 * lewat helper `costPriceOf`, yang berarti tidak bisa bocor ke tabel lain
 * tanpa sengaja.
 */
const COST_PRICE: Record<string, number> = {
  'Amoxicillin 500mg': 12000,
  'Paracetamol 500mg': 5500,
  'Cetirizine 10mg': 8000,
  'Omeprazole 20mg': 9600,
  'Vitamin C 500mg': 14500,
  'Ibuprofen 400mg': 9000,
  'Loratadine 10mg': 7200,
  'ORS Powder': 4100,
}

/** Harga pokok sebuah obat, atau 0 bila tidak tercatat. */
export function costPriceOf(medicineName: string): number {
  return COST_PRICE[medicineName] ?? 0
}

/* ==========================================================================
   DATA BATCH / STOK OPNAME (halaman /obat)
   ========================================================================== */

/**
 * Tanggal acuan untuk menentukan status Kadaluwarsa.
 * Dipatok (tidak memakai `new Date()`) supaya status demo stabil dan tidak
 * berubah sendiri setiap hari.
 */
export const TODAY = '2026-09-14'

/** Batas "Segera Kadaluwarsa": masih di bawah 90 hari dari tanggal acuan. */
export const SEGERA_HARI = 90

export type BatchStatus = 'Aman' | 'Segera' | 'Kadaluwarsa'

export type Batch = {
  /** No. Batch / Lot dari pabrik. */
  lot: string
  /** Tanggal barang diterima di apotek (YYYY-MM-DD). */
  masuk: string
  /** Tanggal kedaluwarsa (YYYY-MM-DD). */
  kedaluwarsa: string
  /** Sisa stok batch ini. */
  stok: number
}

export type Obat = {
  id: string
  nama: string
  sku: string
  kategori: string
  hargaJual: number
  batches: Batch[]
}

/** Ubah 'YYYY-MM-DD' menjadi epoch milidetik agar bisa dibandingkan. */
function toTime(date: string): number {
  const parsed = Date.parse(`${date}T00:00:00`)
  return Number.isNaN(parsed) ? 0 : parsed
}

const HARI = 24 * 60 * 60 * 1000

/** Status satu batch: Aman / Segera / Kadaluwarsa. */
export function statusBatch(kedaluwarsa: string, acuan: string = TODAY): BatchStatus {
  const selisih = (toTime(kedaluwarsa) - toTime(acuan)) / HARI
  if (selisih < 0) return 'Kadaluwarsa'
  if (selisih <= SEGERA_HARI) return 'Segera'
  return 'Aman'
}

/** 'safe' | 'warning' | 'danger' sesuai gaya badge yang sudah dipakai app. */
export function toneStatus(status: BatchStatus): 'safe' | 'warning' | 'danger' {
  if (status === 'Kadaluwarsa') return 'danger'
  if (status === 'Segera') return 'warning'
  return 'safe'
}

/** Urutkan batch dari yang paling dekat kedaluwarsanya (FEFO). */
export function urutBatchFEFO(batches: Batch[]): Batch[] {
  return [...batches].sort((a, b) => toTime(a.kedaluwarsa) - toTime(b.kedaluwarsa))
}

/** Batch dengan tanggal kedaluwarsa terdekat, atau null bila stok habis. */
export function batchTerdekat(batches: Batch[]): Batch | null {
  const tersedia = urutBatchFEFO(batches.filter((batch) => batch.stok > 0))
  return tersedia[0] ?? null
}

/** Total seluruh stok obat (semua batch). */
export function totalStok(batches: Batch[]): number {
  return batches.reduce((sum, batch) => sum + batch.stok, 0)
}

/** Status FEFO sebuah obat: mengikuti batch terdekat kedaluwarsanya. */
export function statusObat(batches: Batch[], acuan: string = TODAY): BatchStatus {
  const terdekat = batchTerdekat(batches)
  if (!terdekat) return 'Kadaluwarsa'
  return statusBatch(terdekat.kedaluwarsa, acuan)
}

/** Format tanggal Indonesia, contoh: "12 Apr 2026". */
export function formatTanggal(date: string): string {
  const parsed = new Date(`${date}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return date
  return parsed.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

/** Sisa hari menuju kedaluwarsa (negatif = sudah lewat). */
export function sisaHari(kedaluwarsa: string, acuan: string = TODAY): number {
  return Math.round((toTime(kedaluwarsa) - toTime(acuan)) / HARI)
}

/**
 * True bila `date` adalah tanggal ISO 'YYYY-MM-DD' yang bisa diurai
 * dan berada di rentang yang masuk akal (tahun 2000-2100).
 */
export function isTanggalValid(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false
  const parsed = Date.parse(`${date}T00:00:00`)
  if (Number.isNaN(parsed)) return false
  const year = Number(date.slice(0, 4))
  return year >= 2000 && year <= 2100
}

/** True bila batch sudah lewat dari tanggal acuan. */
export function sudahKedaluwarsa(kedaluwarsa: string, acuan: string = TODAY): boolean {
  return statusBatch(kedaluwarsa, acuan) === 'Kadaluwarsa'
}

/**
 * Pilih batch untuk dijual dengan aturan FEFO (First Expired, First Out):
 * ambil batch dengan tanggal kedaluwarsa **terdekat yang belum kedaluwarsa**
 * dan yang masih punya stok.
 *
 * Mengembalikan `null` bila tidak ada batch yang layak jual — artinya seluruh
 * batch obat tersebut sudah kedaluwarsa atau stoknya habis.
 */
export function pilihBatchFEFO(batches: Batch[], acuan: string = TODAY): Batch | null {
  const layak = urutBatchFEFO(
    batches.filter((batch) => batch.stok > 0 && !sudahKedaluwarsa(batch.kedaluwarsa, acuan)),
  )
  return layak[0] ?? null
}

/** True bila tidak ada satu pun batch obat ini yang boleh dijual. */
export function semuaBatchKedaluwarsa(batches: Batch[], acuan: string = TODAY): boolean {
  return pilihBatchFEFO(batches, acuan) === null
}

export const obatList: Obat[] = [
  {
    id: 'obt-001', nama: 'Amoxicillin 500mg', sku: 'OBT-AMD-001', kategori: 'Antibiotik', hargaJual: 18000,
    batches: [
      { lot: 'LOT-2409-A', masuk: '2025-11-05', kedaluwarsa: '2026-08-30', stok: 8 },
      { lot: 'LOT-2503-B', masuk: '2026-03-12', kedaluwarsa: '2027-03-11', stok: 16 },
    ],
  },
  {
    id: 'obt-002', nama: 'Paracetamol 500mg', sku: 'OBT-PRC-002', kategori: 'Analgesik', hargaJual: 8500,
    batches: [
      { lot: 'LOT-2410-A', masuk: '2025-12-01', kedaluwarsa: '2026-11-28', stok: 60 },
      { lot: 'LOT-2502-B', masuk: '2026-02-18', kedaluwarsa: '2027-02-17', stok: 56 },
      { lot: 'LOT-2506-C', masuk: '2026-06-10', kedaluwarsa: '2028-06-09', stok: 40 },
    ],
  },
  {
    id: 'obt-003', nama: 'Cetirizine 10mg', sku: 'OBT-CET-003', kategori: 'Antialergi', hargaJual: 12000,
    batches: [
      { lot: 'LOT-2412-A', masuk: '2026-01-09', kedaluwarsa: '2026-10-05', stok: 12 },
      { lot: 'LOT-2505-B', masuk: '2026-05-20', kedaluwarsa: '2027-05-19', stok: 6 },
    ],
  },
  {
    id: 'obt-004', nama: 'Omeprazole 20mg', sku: 'OBT-OMP-004', kategori: 'Lambung', hargaJual: 14500,
    batches: [
      { lot: 'LOT-2501-A', masuk: '2025-10-15', kedaluwarsa: '2027-01-14', stok: 45 },
      { lot: 'LOT-2507-B', masuk: '2026-07-02', kedaluwarsa: '2028-07-01', stok: 37 },
    ],
  },
  {
    id: 'obt-005', nama: 'Ibuprofen 400mg', sku: 'OBT-IBU-005', kategori: 'Analgesik', hargaJual: 13500,
    batches: [
      { lot: 'LOT-2503-X', masuk: '2026-03-02', kedaluwarsa: '2028-02-28', stok: 70 },
      { lot: 'LOT-2507-Y', masuk: '2026-07-15', kedaluwarsa: '2027-07-14', stok: 44 },
    ],
  },
  {
    id: 'obt-006', nama: 'Loratadine 10mg', sku: 'OBT-LOR-006', kategori: 'Antialergi', hargaJual: 11000,
    batches: [
      { lot: 'LOT-2502-L', masuk: '2026-02-01', kedaluwarsa: '2027-01-31', stok: 55 },
      { lot: 'LOT-2506-M', masuk: '2026-06-20', kedaluwarsa: '2026-12-15', stok: 30 },
    ],
  },
  {
    id: 'obt-007', nama: 'Vitamin C 500mg', sku: 'OBT-VTC-007', kategori: 'Vitamin', hargaJual: 22000,
    batches: [
      { lot: 'LOT-2411-C', masuk: '2025-11-20', kedaluwarsa: '2026-08-15', stok: 6 },
      { lot: 'LOT-2504-A', masuk: '2026-04-11', kedaluwarsa: '2026-09-30', stok: 22 },
      { lot: 'LOT-2508-B', masuk: '2026-08-01', kedaluwarsa: '2027-07-31', stok: 14 },
    ],
  },
  {
    id: 'obt-008', nama: 'ORS Powder', sku: 'OBT-ORS-008', kategori: 'Vitamin', hargaJual: 6500,
    batches: [
      { lot: 'LOT-2504-P', masuk: '2026-04-25', kedaluwarsa: '2026-10-20', stok: 65 },
      { lot: 'LOT-2508-O', masuk: '2026-08-05', kedaluwarsa: '2027-08-04', stok: 120 },
    ],
  },
  {
    // DEMO: SELURUH batch obat ini sudah kedaluwarsa.
    // Dipakai untuk mendemonstrasikan pemblokiran transaksi di halaman /kasir.
    id: 'obt-009', nama: 'Tetracycline 250mg', sku: 'OBT-TET-009', kategori: 'Antibiotik', hargaJual: 9800,
    batches: [
      { lot: 'LOT-2408-X', masuk: '2024-08-10', kedaluwarsa: '2026-03-12', stok: 14 },
      { lot: 'LOT-2412-Y', masuk: '2024-12-02', kedaluwarsa: '2026-06-18', stok: 9 },
    ],
  },
]