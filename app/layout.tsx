import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { THEME_BOOT_SCRIPT } from '@/lib/theme'
import './globals.css'

export const metadata: Metadata = {
  title: 'HealTI | Dashboard Apotek',
  description: 'Sistem manajemen inventaris dan transaksi apotek.',
  generator: 'v0.app',
  // Favicon & apple-icon diambil dari konvensi file Next.js:
  //   app/favicon.ico      -> <link rel="icon" sizes="any">
  //   app/apple-icon.png   -> <link rel="apple-touch-icon">
  // Jangan menulis blok `icons` di sini, karena akan menimpa konvensi file.
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f6f8fb' },
    { media: '(prefers-color-scheme: dark)', color: '#0d1320' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        {/*
          Terapkan tema sebelum first paint. Tanpa ini halaman sempat
          tampil dengan tema yang salah lalu berkedip setelah hydration.
          dangerouslySetInnerHTML dipakai karena skrip harus inline.
        */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
