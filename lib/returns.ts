import { TODAY, type Obat } from '@/lib/data'

export const RETUR_STORE_KEY = 'healti_retur'
export const RETUR_CHANGE_EVENT = 'healti:retur-change'

export const ALASAN_RETUR = ['Kedaluwarsa', 'Rusak', 'Selisih stok', 'Lainnya'] as const
export const STATUS_RETUR = ['Diajukan', 'Dikirim', 'Selesai'] as const

export type AlasanRetur = (typeof ALASAN_RETUR)[number]
export type StatusRetur = (typeof STATUS_RETUR)[number]

export type Retur = {
  id: string
  nomorRetur: string
  idBatch: string
  namaObat: string
  nomorBatch: string
  supplier: string
  jumlah: number
  alasan: AlasanRetur
  status: StatusRetur
  tanggal: string
  namaPengaju: string
  catatan: string
}

export type ReturInput = Omit<Retur, 'id' | 'nomorRetur' | 'status' | 'tanggal'>

const RETUR_AWAL: Retur[] = [
  {
    id: 'retur-0031',
    nomorRetur: 'RT-2026-0031',
    idBatch: 'obt-009:LOT-2408-X',
    namaObat: 'Tetracycline 250mg',
    nomorBatch: 'LOT-2408-X',
    supplier: 'PT Sehat Farma',
    jumlah: 14,
    alasan: 'Kedaluwarsa',
    status: 'Diajukan',
    tanggal: '2026-09-02',
    namaPengaju: 'Rina Wijaya',
    catatan: 'Seluruh batch kedaluwarsa dan kemasan rusak.',
  },
  {
    id: 'retur-0028',
    nomorRetur: 'RT-2026-0028',
    idBatch: 'obt-001:LOT-2409-A',
    namaObat: 'Amoxicillin 500mg',
    nomorBatch: 'LOT-2409-A',
    supplier: 'CV Medika Jaya',
    jumlah: 8,
    alasan: 'Kedaluwarsa',
    status: 'Diajukan',
    tanggal: '2026-08-31',
    namaPengaju: 'Dewi Lestari',
    catatan: 'Batch kedaluwarsa sebelum sempat terjual.',
  },
]

function isRetur(value: unknown): value is Retur {
  if (!value || typeof value !== 'object') return false
  const row = value as Partial<Retur>
  return (
    typeof row.id === 'string' &&
    typeof row.nomorRetur === 'string' &&
    typeof row.idBatch === 'string' &&
    typeof row.namaObat === 'string' &&
    typeof row.nomorBatch === 'string' &&
    typeof row.supplier === 'string' &&
    typeof row.jumlah === 'number' &&
    typeof row.alasan === 'string' &&
    ALASAN_RETUR.includes(row.alasan as AlasanRetur) &&
    typeof row.status === 'string' &&
    STATUS_RETUR.includes(row.status as StatusRetur) &&
    typeof row.tanggal === 'string' &&
    typeof row.namaPengaju === 'string' &&
    typeof row.catatan === 'string'
  )
}

function readStore(): Retur[] | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(RETUR_STORE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return null
    return parsed.filter(isRetur)
  } catch {
    return null
  }
}

function writeStore(data: Retur[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(RETUR_STORE_KEY, JSON.stringify(data))
    window.dispatchEvent(new Event(RETUR_CHANGE_EVENT))
  } catch {
    return
  }
}

function nomorBerikutnya(data: Retur[]): string {
  const tahun = TODAY.slice(0, 4)
  const terbesar = data.reduce((maksimum, row) => {
    const angka = Number(row.nomorRetur.split('-').at(-1))
    return Number.isFinite(angka) ? Math.max(maksimum, angka) : maksimum
  }, 0)
  return `RT-${tahun}-${String(terbesar + 1).padStart(4, '0')}`
}

export function listRetur(): Retur[] {
  const tersimpan = readStore()
  if (tersimpan) return tersimpan
  writeStore(RETUR_AWAL)
  return RETUR_AWAL
}

export function createRetur(input: ReturInput): Retur {
  const data = listRetur()
  const retur: Retur = {
    ...input,
    id: `retur-${Date.now()}-${data.length + 1}`,
    nomorRetur: nomorBerikutnya(data),
    status: 'Diajukan',
    tanggal: TODAY,
  }
  writeStore([retur, ...data])
  return retur
}

export function updateStatusRetur(id: string, status: StatusRetur): Retur | null {
  const data = listRetur()
  const index = data.findIndex((row) => row.id === id)
  if (index < 0) return null

  const statusSaatIni = data[index].status
  const transisiValid =
    (statusSaatIni === 'Diajukan' && status === 'Dikirim') ||
    (statusSaatIni === 'Dikirim' && status === 'Selesai')
  if (!transisiValid) return null

  const diperbarui = data.map((row) => (row.id === id ? { ...row, status } : row))
  writeStore(diperbarui)
  return diperbarui[index]
}

export function cancelRetur(id: string): boolean {
  const data = listRetur()
  const target = data.find((row) => row.id === id)
  if (!target || target.status !== 'Diajukan') return false
  writeStore(data.filter((row) => row.id !== id))
  return true
}

export function jumlahReturDikirim(data: Retur[], idBatch: string): number {
  return data
    .filter(
      (row) =>
        row.idBatch === idBatch && (row.status === 'Dikirim' || row.status === 'Selesai'),
    )
    .reduce((total, row) => total + row.jumlah, 0)
}

export function stokBatchSetelahRetur(stok: number, idBatch: string, data: Retur[]): number {
  return Math.max(0, stok - jumlahReturDikirim(data, idBatch))
}

export function obatDenganStokRetur(daftar: Obat[], data: Retur[]): Obat[] {
  return daftar.map((obat) => ({
    ...obat,
    batches: obat.batches.map((batch) => ({
      ...batch,
      stok: stokBatchSetelahRetur(batch.stok, `${obat.id}:${batch.lot}`, data),
    })),
  }))
}
