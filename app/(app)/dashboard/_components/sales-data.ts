/**
 * Data penjualan untuk grafik ringkasan (data demo).
 *
 * Angkanya sengaja disimpan sebagai angka, bukan string SVG path supaya:
 *   - total dan sumbu Y bisa dihitung dari data yang sama (tidak pernah
 *     terlihat tidak sinkron seperti label "50jt" pada grafik "Bulan Ini"),
 *   - nilai tiap titik bisa dibaca screen reader lewat tabel fallback,
 *   - format tampilan (ribuan) terpisah dari data.
 *
 * `previous` adalah periode sepanjang sama sebelumnya, dipakai untuk menghitung
 * perubahan — bukan angka yang ditulis manual per periode.
 */
export type SalesPeriodKey = 'enam-bulan' | 'tiga-bulan' | 'bulan-ini'

export type SalesPeriod = {
  key: SalesPeriodKey
  label: string
  /** Sumbu horizontal, mis. ['Des', 'Jan', ...] */
  labels: string[]
  /** Omzet per titik, dalam rupiah penuh. */
  values: number[]
  /** Omzet periode sepanjang sama sebelumnya, untuk menghitung pertumbuhan. */
  previous: number[]
  /** Frasa yang menjelaskan periode pembanding, ditampilkan di bawah angka. */
  compareLabel: string
}

export const SALES_PERIODS: SalesPeriod[] = [
  {
    key: 'enam-bulan',
    label: '6 Bulan Terakhir',
    labels: ['Des', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei'],
    values: [6_200_000, 6_900_000, 7_400_000, 8_100_000, 9_200_000, 10_820_000],
    previous: [5_300_000, 5_900_000, 6_400_000, 7_000_000, 7_800_000, 8_600_000],
    compareLabel: '6 bulan sebelumnya',
  },
  {
    key: 'tiga-bulan',
    label: '3 Bulan Terakhir',
    labels: ['Mar', 'Apr', 'Mei'],
    values: [8_100_000, 9_200_000, 10_820_000],
    previous: [7_000_000, 7_800_000, 8_600_000],
    compareLabel: '3 bulan sebelumnya',
  },
  {
    key: 'bulan-ini',
    label: 'Bulan Ini',
    labels: ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'],
    values: [2_100_000, 2_650_000, 3_400_000, 4_620_000],
    previous: [1_800_000, 2_200_000, 2_600_000, 3_200_000],
    compareLabel: '4 minggu sebelumnya',
  },
]

/** Jumlah nilai satu periode. */
export const totalOf = (values: number[]) => values.reduce((sum, value) => sum + value, 0)

/** Pertumbuhan periode terhadap periode pembanding, dalam persen. */
export const growthOf = (period: SalesPeriod) => {
  const now = totalOf(period.values)
  const before = totalOf(period.previous)
  return before === 0 ? 0 : ((now - before) / before) * 100
}

/** "Rp 48.620.000" — pemisah ribuan gaya Indonesia. */
export const rupiah = (value: number) => `Rp ${value.toLocaleString('id-ID')}`

/** Ringkas untuk sumbu Y: 12.400.000 -> "12,4 jt". */
export function ringkasJuta(value: number): string {
  if (value === 0) return '0'
  const juta = value / 1_000_000
  return `${juta.toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`
}