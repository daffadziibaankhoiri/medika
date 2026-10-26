'use client'

import { useState } from 'react'
import { XCircle, CheckCircle, AlertTriangle, CalendarDays, Boxes } from 'lucide-react'
import { Button, DataTable, EmptyRow } from '@/components/ui'

export type NotificationTone = 'danger' | 'warning' | 'info'

export type AppNotification = {
  tone: NotificationTone
  icon: ReactNode
  title: string
  body: string
  time: string
}

import type { ReactNode } from 'react'

export const NOTIFICATIONS: AppNotification[] = [
  { tone: 'danger', icon: <AlertTriangle aria-hidden="true" />, title: '2 obat sudah Kadaluwarsa', body: 'Amoxicillin 500mg perlu dipisahkan dari stok aktif.', time: 'Baru saja' },
  { tone: 'warning', icon: <CalendarDays aria-hidden="true" />, title: '10 obat mendekati kedaluwarsa', body: 'Segera buat rencana retur atau penyesuaian stok.', time: '2 jam lalu' },
  { tone: 'info', icon: <Boxes aria-hidden="true" />, title: '5 stok obat menipis', body: 'Di bawah batas minimum, siapkan pesanan baru.', time: 'Hari ini' },
]

const TONE_PRIORITY: Record<NotificationTone, number> = { danger: 0, warning: 1, info: 2 }

export function sortNotifications(items: AppNotification[]): AppNotification[] {
  return [...items].sort((a, b) => TONE_PRIORITY[a.tone] - TONE_PRIORITY[b.tone])
}

type NotificationRow = {
  key: string
  tone: NotificationTone
  title: string
  body: string
  time: string
  expanded: boolean
  setExpanded: (key: string) => void
}

export function NotifikasiPage() {
  const [notifications] = useState(sortNotifications(NOTIFICATIONS))
  const [openExpand, setOpenExpand] = useState<Map<string, boolean>>(new Map())

  const toggleExpand = (key: string) => {
    setOpenExpand((prev) => {
      const next = new Map(prev)
      next.set(key, !next.get(key) || false)
      return next
    })
  }

  const rows = notifications.map((n) => ({
    key: n.title,
    tone: n.tone,
    title: n.title,
    body: n.body,
    time: n.time,
    expanded: openExpand.get(n.title) || false,
    setExpanded: toggleExpand,
  }))

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-semibold text-lg">Notifikasi</h2>
        <p className="text-sm text-muted-foreground">
          Total {notifications.length} notifikasi
        </p>
      </div>

      {notifications.length === 0 && (
        <EmptyRow colSpan={2}>
          Tidak ada notifikasi baru.
        </EmptyRow>
      )}

      <DataTable label="Daftar notifikasi">
        <thead>
          <tr>
            <th scope="col">Tanggal</th>
            <th scope="col">Kategori</th>
            <th scope="col">Judul</th>
            <th scope="col">Detail</th>
            <th scope="col">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <EmptyRow colSpan={5}>
              Tidak ada notifikasi.
            </EmptyRow>
          ) : rows.map((row) => (
            <tr key={row.key}>
              <td className="font-medium">{row.time}</td>
              <td>
                <span className={`inline-flex items-center rounded-md ${row.tone === 'danger' ? 'bg-red-100 text-red-800' : row.tone === 'warning' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                  {row.tone === 'danger' ? <AlertTriangle className="h-3 w-3" /> : row.tone === 'warning' ? <CalendarDays className="h-3 w-3" /> : <Boxes className="h-3 w-3" />}
                  <span className="ml-1 text-xs font-medium">{row.tone}</span>
                </span>
              </td>
              <td>
                <div className="truncate max-w-xs">{row.title}</div>
              </td>
              <td>
                {row.expanded && (
                  <div className="mt-2 text-sm line-clamp-3">
                    {row.body}
                  </div>
                )}
              </td>
              <td>
                <button
                  onClick={() => row.setExpanded(row.key)}
                  className="text-sm text-primary hover:underline"
                >
                  {row.expanded ? 'Sembunyikan detail' : 'Lihat detail'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </div>
  )
}