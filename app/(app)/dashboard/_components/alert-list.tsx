'use client'

import { useRouter } from 'next/navigation'
import { AlertTriangle, Boxes, CalendarDays, ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'

type AlertItem = {
  tone: 'danger' | 'warning' | 'info'
  icon: ReactNode
  title: string
  detail: string
  /** Filter yang diterapkan di /obat. */
  filter: string
  /** Halaman tujuan; filter dipakai kalau tujuan adalah /obat. */
  href: string
}

/**
 * Daftar obat yang perlu ditindaklanjuti.
 *
 * Ini satu-satunya tempat "Perlu Perhatian" muncul di dashboard. Sebelumnya
 * angka yang sama juga muncul sebagai kartu statistik dengan isi berbeda, jadi
 * pengguna bisa salah pilih yang mana yang benar.
 */
const ITEMS: AlertItem[] = [
  {
    tone: 'danger', icon: <AlertTriangle />,
    title: '2 obat sudah kadaluarsa',
    detail: 'Segera pisahkan dari stok aktif',
    filter: 'expired', href: '/obat?filter=expired',
  },
  {
    tone: 'warning', icon: <CalendarDays />,
    title: '10 obat mendekati kadaluwarsa',
    detail: 'Kadaluwarsa dalam 30 hari',
    filter: 'expiring', href: '/obat?filter=expiring',
  },
  {
    tone: 'info', icon: <Boxes />,
    title: '5 stok obat menipis',
    detail: 'Di bawah batas minimum',
    filter: 'low-stock', href: '/obat?filter=low-stock',
  },
]

export const ALERT_TOTAL = ITEMS.reduce((sum, item) => sum + Number(item.title.split(' ')[0]), 0)

export function AlertList({ headingId }: { headingId: string }) {
  const router = useRouter()

  return (
    <section className="panel alert-panel" aria-labelledby={headingId}>
      <div className="panel-header">
        <div>
          <h2 id={headingId}>Perlu Perhatian</h2>
          <p>Obat yang perlu segera ditindaklanjuti</p>
        </div>
        <button className="link-button" onClick={() => router.push('/obat')}>Lihat semua</button>
      </div>

      <ul className="alert-list">
        {ITEMS.map((item) => (
          <li key={item.filter}>
            <button type="button" className={`alert-item ${item.tone}`} onClick={() => router.push(item.href)}>
              <span className="alert-symbol" aria-hidden="true">{item.icon}</span>
              <span className="alert-copy">
                <strong>{item.title}</strong>
                <span>{item.detail}</span>
              </span>
              <ChevronRight className="alert-chevron" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}