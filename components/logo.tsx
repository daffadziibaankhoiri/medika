'use client'

import Image from 'next/image'

/**
 * Logo HealTI.
 *
 * File aslinya `public/healti-logo.webp` — sudah berbentuk kunci + simbol
 * stetoskop dengan wordmark "HealTI" bergradien biru ke hijau.
 *
 * Varian:
 *  - `full`   : logo + wordmark (untuk sidebar, header, landing)
 *  - `mark`   : hanya lambang/simbol (untuk favicon, avatar kecil)
 *  - `onDark` : untuk latar gelap/gambar (memberi ring putih agar kontras)
 */
export default function Logo({
  variant = 'mark',
  onDark = false,
  size,
  className = '',
}: {
  variant?: 'full' | 'mark'
  onDark?: boolean
  size?: number
  className?: string
}) {
  // Lambang di dalam file logo ada di separuh atas; proporsi ini mengikuti
  // posisi lambang agar tidak ikut terpotong bersama wordmark.
  const proporsi = variant === 'mark' ? 0.54 : 1

  const ukuran = Math.round((size ?? 48) * proporsi)

  return (
    <span
      className={`brand-logo brand-logo-${variant}${onDark ? ' on-dark' : ''} ${className}`.trim()}
    >
      <span className="brand-logo-mark" aria-hidden="true">
        <Image
          src="/healti-logo.webp"
          alt=""
          width={ukuran}
          height={ukuran}
          priority
        />
      </span>
      {variant === 'full' && (
        <span className="brand-logo-text">
          <strong>HealTI</strong>
          <span>Sistem Manajemen Apotek</span>
        </span>
      )}
    </span>
  )
}