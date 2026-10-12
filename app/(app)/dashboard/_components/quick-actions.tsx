'use client'

import { useRouter } from 'next/navigation'
import { FileText, PackagePlus, ShoppingCart } from 'lucide-react'

/**
 * Aksi singkat di header dashboard.
 *
 * Sebelumnya halaman pembuka tidak punya satu pun aksi, padahal tiga tempat
 * di sidebar justru adalah tempat orang paling sering bekerja. Satu tombol
 * utama (Transaksi Baru) plus dua tombol sekunder supaya hierarki jelas.
 */
const ACTIONS = [
  { label: 'Terima Barang', icon: PackagePlus, path: '/obat', primary: false },
  { label: 'Cetak Laporan', icon: FileText, path: '/laporan', primary: false },
]

export function QuickActions() {
  const router = useRouter()

  return (
    <div className="quick-actions">
      <button type="button" className="primary-button" onClick={() => router.push('/kasir')}>
        <ShoppingCart aria-hidden="true" /> Transaksi Baru
      </button>
      {ACTIONS.map(({ label, icon: Icon, path }) => (
        <button key={path} type="button" className="outline-button" onClick={() => router.push(path)}>
          <Icon aria-hidden="true" /> {label}
        </button>
      ))}
    </div>
  )
}