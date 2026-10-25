'use client'

import { useEffect, useState } from 'react'
import {
  listRetur,
  RETUR_CHANGE_EVENT,
  RETUR_STORE_KEY,
  type Retur,
} from '@/lib/returns'

export function useReturns(): { daftar: Retur[]; siap: boolean } {
  const [daftar, setDaftar] = useState<Retur[]>([])
  const [siap, setSiap] = useState(false)

  useEffect(() => {
    const muatUlang = () => {
      setDaftar(listRetur())
      setSiap(true)
    }

    const onStorage = (event: StorageEvent) => {
      if (event.key === RETUR_STORE_KEY) muatUlang()
    }

    muatUlang()
    window.addEventListener(RETUR_CHANGE_EVENT, muatUlang)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener(RETUR_CHANGE_EVENT, muatUlang)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  return { daftar, siap }
}
