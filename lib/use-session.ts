'use client'

import { useEffect, useState } from 'react'
import { readSession, type Role, type Session } from './auth'
import { canViewCostPrice as canViewCostPriceFor } from './permissions'

/**
 * Membaca sesi tiruan di sisi client.
 * Nilai awal `null` sampai cookie selesai diperiksa, supaya server dan
 * client merender markup yang sama (menghindari hydration mismatch).
 */
export function useSession(): { session: Session | null; checked: boolean } {
  const [session, setSession] = useState<Session | null>(null)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    setSession(readSession())
    setChecked(true)
  }, [])

  return { session, checked }
}

/** Role pengguna yang sedang login, atau null bila belum login. */
export function useRole(): Role | null {
  const { session } = useSession()
  return session ? session.role : null
}

/**
 * True bila role saat ini boleh melihat kolom harga pokok.
 * Default false supaya kolom tidak pernah ikut ter-render sebelum sesi diketahui.
 */
export function useCanViewCostPrice(): boolean {
  const { session, checked } = useSession()
  if (!checked || !session) return false
  return canViewCostPriceFor(session.role)
}