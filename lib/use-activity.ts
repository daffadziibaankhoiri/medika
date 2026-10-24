'use client'

import { useEffect } from 'react'
import { checkSession, clearSession, setLoginNotice } from '@/lib/auth'
import { touchUserActivity } from '@/lib/users'

/** Jarak pencatatan aktivitas terakhir. */
const ACTIVITY_INTERVAL_MS = 60_000

/**
 * Pencatatan aktivitas pengguna di satu titik saja (layout utama).
 *
 *  - `lastActiveAt` diperbarui setiap 60 detik selama aplikasi terbuka, dan
 *    juga setiap kali tab kembali terlihat.
 *  - Status akun checked bersamaan. Kalau akun dinonaktifkan atau ditolak
 *    Owner, sesi langsung diakhiri dan pengguna diarahkan ke /login.
 */
export function useActiveUserTracker(userId: string | null): void {
  useEffect(() => {
    const id = userId
    if (!id) return

    let cancelled = false

    async function markActive(activeUserId: string) {
      if (cancelled) return
      await touchUserActivity(activeUserId)
      if (cancelled) return

      const result = await checkSession()
      if (cancelled) return

      if (result.state === 'rejected') {
        setLoginNotice(result.message)
        await clearSession()
        window.location.assign('/login')
      } else if (result.state === 'invalid') {
        await clearSession()
        window.location.assign('/login')
      }
    }

    markActive(id)
    const timer = window.setInterval(() => markActive(id), ACTIVITY_INTERVAL_MS)

    function onVisibilityChange() {
      if (document.visibilityState === 'visible' && id) markActive(id)
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      cancelled = true
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [userId])
}
