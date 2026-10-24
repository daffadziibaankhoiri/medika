import { AlertTriangle, Boxes, CalendarDays } from 'lucide-react'
import type { ReactNode } from 'react'

export type NotificationTone = 'danger' | 'warning' | 'info'

export type AppNotification = {
  tone: NotificationTone
  icon: ReactNode
  title: string
  body: string
  time: string
}

/**
 * Notifikasi aplikasi.
 *
 * Ini satu-satunya sumber data notifikasi. Dipakai bersama oleh dropdown
 * lonceng di topbar dan popup notifikasi dashboard, jadi isi keduanya tidak
 * pernah berbeda dan tidak perlu diduplikasi.
 *
 * Jumlah pada badge dihitung dari isi daftar, bukan angka yang ditulis manual.
 */
export const NOTIFICATIONS: AppNotification[] = [
  { tone: 'danger', icon: <AlertTriangle aria-hidden="true" />, title: '2 obat sudah Kadaluwarsa', body: 'Amoxicillin 500mg perlu dipisahkan dari stok aktif.', time: 'Baru saja' },
  { tone: 'warning', icon: <CalendarDays aria-hidden="true" />, title: '10 obat mendekati kedaluwarsa', body: 'Segera buat rencana retur atau penyesuaian stok.', time: '2 jam lalu' },
  { tone: 'info', icon: <Boxes aria-hidden="true" />, title: '5 stok obat menipis', body: 'Di bawah batas minimum, siapkan pesanan baru.', time: 'Hari ini' },
]

const TONE_PRIORITY: Record<NotificationTone, number> = { danger: 0, warning: 1, info: 2 }

/**
 * Urutkan notifikasi dari yang paling penting (danger) ke yang paling ringan.
 * Notifikasi yang belum dibaca tidak tersedia sebagai data terpisah, jadi
 * prioritasitas tone yang dipakai sebagai pengganti.
 */
export function sortNotifications(items: AppNotification[]): AppNotification[] {
  return [...items].sort((a, b) => TONE_PRIORITY[a.tone] - TONE_PRIORITY[b.tone])
}

/** Daftar notifikasi yang dipakai bersama oleh topbar dan dashboard. */
export function NotificationList({ items }: { items: AppNotification[] }) {
  return (
    <div className="notification-items">
      {items.map((item) => (
        <div key={item.title} className={`notification-item ${item.tone}`}>
          <div className="notification-icon">{item.icon}</div>
          <div><strong>{item.title}</strong><span>{item.body}</span><small>{item.time}</small></div>
        </div>
      ))}
    </div>
  )
}
