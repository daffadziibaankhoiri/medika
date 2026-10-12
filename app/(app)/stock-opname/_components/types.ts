import type { Obat } from '@/lib/data'

export type Tab = 'opname' | 'retur'

export type BarisOpname = {
  obat: Obat
  /** Stok fisik hasil hitungan tangan. String supaya bisa dikosongkan. */
  fisik: string
}

export type Retur = {
  id: string
  obat: string
  supplier: string
  lot: string
  kedaluwarsa: string
  jumlah: number
  alasan: string
  tanggal: string
}

/** Area penyimpanan yang bisa dipilih saat opname. */
export const AREA = ['Semua Area', 'Gudang Utama', 'Rak Depan', 'Rak Belakang', 'Kulkas']

/** Retur yang sudah diajukan (data tiruan). */
export const RETUR_AWAL: Retur[] = [
  {
    id: 'RT-2026-0031', obat: 'Tetracycline 250mg', supplier: 'PT Sehat Farma',
    lot: 'LOT-2408-X', kedaluwarsa: '2026-03-12', jumlah: 14,
    alasan: 'Seluruh batch kedaluwarsa, kemasan rusak.', tanggal: '2026-09-02',
  },
  {
    id: 'RT-2026-0028', obat: 'Amoxicillin 500mg', supplier: 'CV Medika Jaya',
    lot: 'LOT-2409-A', kedaluwarsa: '2026-08-30', jumlah: 8,
    alasan: 'Batch kedaluwarsa sebelum sempat terjual.', tanggal: '2026-08-31',
  },
]