'use client'

import { useCallback, useEffect, useState } from 'react'
import { NOTIFICATIONS, NotificationList, sortNotifications } from '@/components/notifications'
import { Button, Modal } from '@/components/ui'
import { DASHBOARD_POPUP_SHOWN_KEY, OPEN_NOTIFICATIONS_EVENT } from '@/lib/notifications'

/** Maksimal notifikasi yang ditampilkan di dalam popup. */
const MAX_ITEMS = 5

/**
 * Popup notifikasi dashboard.
 *
 * Muncul otomatis sekali saja pada setiap sesi login. Penandanya disimpan di
 * sessionStorage, jadi berpindah halaman lalu kembali ke /dashboard tidak
 * memunculkan popup lagi, tetapi login baru (atau logout lalu login lagi)
 * memunculkannya kembali.
 */
export function NotificationPopup() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (NOTIFICATIONS.length === 0) return

    try {
      if (window.sessionStorage.getItem(DASHBOARD_POPUP_SHOWN_KEY)) return
      // Ditandai saat popup pertama kali ditampilkan, bukan saat ditutup.
      window.sessionStorage.setItem(DASHBOARD_POPUP_SHOWN_KEY, '1')
    } catch {
      // sessionStorage diblokir browser: popup tetap ditampilkan sekali.
    }

    setOpen(true)
  }, [])

  const close = useCallback(() => setOpen(false), [])

  const viewAll = useCallback(() => {
    setOpen(false)
    window.dispatchEvent(new CustomEvent(OPEN_NOTIFICATIONS_EVENT))
  }, [])

  if (!open) return null

  const items = sortNotifications(NOTIFICATIONS).slice(0, MAX_ITEMS)

  return (
    <Modal
      title="Notifikasi"
      description="Perlu perhatian hari ini"
      onClose={close}
    >
      <NotificationList items={items} />
      <div className="modal-actions">
        <Button secondary onClick={viewAll}>Lihat Semua</Button>
        <Button onClick={close}>Tutup</Button>
      </div>
    </Modal>
  )
}
