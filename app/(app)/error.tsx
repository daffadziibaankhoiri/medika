'use client'

import { useEffect } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

/**
 * Error boundary level rute.
 *
 * Next.js mewajibkan file ini jadi Client Component. `reset()` dipakai untuk
 * mencoba render ulang tanpa memuat ulang seluruh halaman, dan pesan errornya
 * ditulis supaya tetap berguna: apa yang terjadi, dan apa yang bisa dilakukan.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Di produksi ini biasanya diteruskan ke layanan pemantauan error.
    console.error(error)
  }, [error])

  return (
    <div className="error-page">
      <div className="error-card" role="alert">
        <div className="error-icon" aria-hidden="true">
          <AlertTriangle />
        </div>
        <h1>Halaman gagal dimuat</h1>
        <p>
          Ada yang tidak beres saat memuat bagian ini. Data yang sudah tersimpan
          tidak ikut berubah, jadi aman untuk mencoba lagi.
        </p>
        {error.digest && <p className="error-digest">Kode kesalahan: {error.digest}</p>}
        <button type="button" className="primary-button error-retry" onClick={reset}>
          <RotateCcw aria-hidden="true" /> Coba lagi
        </button>
      </div>
    </div>
  )
}