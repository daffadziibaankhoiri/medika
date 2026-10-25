import type { Obat } from '@/lib/data'

export type Tab = 'opname' | 'retur'

export type BarisOpname = {
  obat: Obat
  /** Stok fisik hasil hitungan tangan. String supaya bisa dikosongkan. */
  fisik: string
}

/** Area penyimpanan yang bisa dipilih saat opname. */
export const AREA = ['Semua Area', 'Gudang Utama', 'Rak Depan', 'Rak Belakang', 'Kulkas']
