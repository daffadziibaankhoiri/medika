'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { applyTheme, currentTheme, type Theme } from '@/lib/theme'

/**
 * Tombol light/dark di topbar.
 *
 * `aria-pressed` menyatakan status tombol, dan `aria-label` menjelaskan aksi
 * yang terjadi (bukan sekadar nama ikon), supaya screen reader mengumumkannya
 * dengan benar.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null)

  // Tema baru diketahui setelah hydration; sebelum itu tombol disembunyikan
  // supaya tidak sempat menampilkan ikon yang salah.
  useEffect(() => setTheme(currentTheme()), [])

  if (!theme) return <div className="icon-button theme-toggle theme-toggle-placeholder" aria-hidden="true" />

  const next: Theme = theme === 'dark' ? 'light' : 'dark'
  const label = next === 'dark' ? 'Aktifkan mode gelap' : 'Aktifkan mode terang'

  return (
    <button
      type="button"
      className="icon-button theme-toggle"
      aria-label={label}
      aria-pressed={theme === 'dark'}
      title={label}
      onClick={() => {
        applyTheme(next)
        setTheme(next)
      }}
    >
      {theme === 'dark' ? <Moon aria-hidden="true" /> : <Sun aria-hidden="true" />}
    </button>
  )
}