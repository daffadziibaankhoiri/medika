export const medicines = [
  { name: 'Amoxicillin 500mg', category: 'Antibiotik', stock: 24, expiry: '12 Apr 2024', status: 'Kadaluarsa', tone: 'danger', price: 18000 },
  { name: 'Paracetamol 500mg', category: 'Analgesik', stock: 156, expiry: '28 Nov 2024', status: 'Aman', tone: 'safe', price: 8500 },
  { name: 'Cetirizine 10mg', category: 'Antialergi', stock: 18, expiry: '03 Jun 2024', status: 'Segera', tone: 'warning', price: 12000 },
  { name: 'Omeprazole 20mg', category: 'Lambung', stock: 82, expiry: '16 Jan 2025', status: 'Aman', tone: 'safe', price: 14500 },
  { name: 'Vitamin C 500mg', category: 'Vitamin', stock: 42, expiry: '21 Mei 2024', status: 'Segera', tone: 'warning', price: 22000 },
]
export const categories = ['Antibiotik', 'Analgesik', 'Antialergi', 'Lambung', 'Vitamin']
export const suppliers = [
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
}

/** Harga pokok sebuah obat, atau 0 bila tidak tercatat. */
export function costPriceOf(medicineName: string): number {
  return COST_PRICE[medicineName] ?? 0
}