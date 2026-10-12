import AppShell from '@/components/app-shell'

/**
 * Layout untuk seluruh halaman di dalam shell aplikasi.
 *
 * Shell (sidebar + topbar) dideklarasikan sekali di sini, bukan di setiap
 * `page.tsx`. Halaman di bawahnya tetap Server Component: hanya view yang
 * butuh interaksi yang menandai dirinya sendiri dengan 'use client'.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>
}