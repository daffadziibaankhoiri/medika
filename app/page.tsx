'use client'

import { useEffect, useState } from 'react'
import { Landing } from '@/components/landing'
import { readSession } from '@/lib/auth'
import { defaultPathForRole } from '@/lib/permissions'

/**
 * Halaman "/" .
 *  - Belum punya sesi  : tampilkan landing publik.
 *  - Sudah punya sesi   : arahkan ke halaman pertama yang diizinkan role.
 */
export default function HomePage() {
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const session = readSession()
    setChecked(true)
    if (session) window.location.assign(defaultPathForRole(session.role))
  }, [])

  if (!checked) return <div className="landing-page" />

  return <Landing onEnter={() => window.location.assign('/login')} />
}