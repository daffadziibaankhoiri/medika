'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Bell, Boxes, ClipboardList, FileText, LayoutDashboard, Lock,
  LogOut, Menu, PackageCheck, Plus, Settings, ShieldCheck, ShieldX, ShoppingCart, Truck, Users, X,
  ChevronDown,
} from 'lucide-react'
import { checkSession, clearSession, initialsOf, setLoginNotice, type Session } from '@/lib/auth'
import { canAccess, permissionFromPath, type Permission } from '@/lib/permissions'
import { OPEN_NOTIFICATIONS_EVENT } from '@/lib/notifications'
import { NOTIFICATIONS, NotificationList } from '@/components/notifications'
import { useActiveUserTracker } from '@/lib/use-activity'
import { ThemeToggle } from '@/components/theme-toggle'
import Logo from '@/components/logo'

type NavItem = {
  path: string
  label: string
  icon: typeof LayoutDashboard
  permission: Permission
}

const NAV_ITEMS: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: 'dashboard' },
  { path: '/obat', label: 'Manajemen Obat', icon: PackageCheck, permission: 'obat' },
  { path: '/kategori', label: 'Kategori Obat', icon: Boxes, permission: 'kategori' },
  { path: '/kasir', label: 'Kasir / Transaksi', icon: ShoppingCart, permission: 'kasir' },
  { path: '/supplier', label: 'Manajemen Supplier', icon: Truck, permission: 'supplier' },
  { path: '/stock-opname', label: 'Stock Opname', icon: ClipboardList, permission: 'stock-opname' },
  { path: '/laporan', label: 'Laporan Penjualan', icon: FileText, permission: 'laporan' },
  { path: '/pengaturan', label: 'Pengaturan', icon: Settings, permission: 'pengaturan' },
  { path: '/akun', label: 'Kelola Akun', icon: Users, permission: 'akun' },
]

/**
 * Notifikasi topbar.
 *
 * Data dan daftar notifikasinya berada di components/notifications.tsx supaya
 * popup dashboard memakai sumber yang sama.
 */

function Brand() {
  return (
    <div className="brand">
      <Logo size={40} />
    </div>
  )
}

function AccessDenied({ session, onGoHome }: { session: Session; onGoHome: () => void }) {
  return (
    <div className="access-denied">
      <div className="access-denied-card">
        <div className="access-denied-icon"><ShieldX aria-hidden="true" /></div>
        <h1>Akses ditolak</h1>
        <p>
          Halaman ini tidak tersedia untuk akun dengan role{' '}
          <strong>{session.role}</strong>. Hubungi Owner apotek bila Anda merasa
          seharusnya memiliki akses ke halaman ini.
        </p>
        <div className="access-denied-meta">
          <Lock aria-hidden="true" /> Terdaftar sebagai {session.name} ({session.email})
        </div>
        <button className="landing-primary" onClick={onGoHome}>
          Kembali ke halaman utama
        </button>
      </div>
    </div>
  )
}

/**
 * Shell aplikasi: sidebar + topbar.
 * Menu sidebar difilter sesuai role sesi. Bila URL yang diakses tidak diizinkan,
 * halaman "Akses ditolak" ditampilkan di dalam shell (bukan redirect),
 * supaya pengguna tetap bisa memilih menu lain.
 */
export default function AppShell({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [sessionChecked, setSessionChecked] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const pathname = usePathname()
  const path = pathname || '/dashboard'

  // Sesi diperiksa ulang setiap navigasi. Kalau akunnya dinonaktifkan atau
  // ditolak Owner saat sedang dipakai, sesi langsung diakhiri dan pengguna
  // diarahkan ke /login dengan pesan yang sesuai.
  useEffect(() => {
    let cancelled = false

    async function validate() {
      const result = await checkSession()
      if (cancelled) return

      if (result.state === 'valid') {
        setSession(result.session)
        setSessionChecked(true)
        return
      }

      if (result.state === 'rejected') {
        setLoginNotice(result.message)
        await clearSession()
      } else {
        await clearSession()
      }

      window.location.assign('/login')
    }

    validate()
    return () => {
      cancelled = true
    }
  }, [path])

  // Popup notifikasi dashboard memakai tombol "Lihat Semua" untuk membuka
  // dropdown lengkap di topbar.
  useEffect(() => {
    function openNotifications() {
      setNotificationOpen(true)
    }
    window.addEventListener(OPEN_NOTIFICATIONS_EVENT, openNotifications)
    return () => window.removeEventListener(OPEN_NOTIFICATIONS_EVENT, openNotifications)
  }, [])

  // Aktivitas terakhir dicatat berkala di satu titik saja (layout utama).
  useActiveUserTracker(session?.id ?? null)

  const logout = async () => {
    await clearSession()
    window.location.assign('/login')
  }

  if (!sessionChecked) {
    return <div className="app-shell"><main className="main-content app-shell-loading" /></div>
  }

  // Tanpa sesi, proxy akan mengarahkan ke /login.
  if (!session) return null

  const allowedItems = NAV_ITEMS.filter((item) => canAccess(session.role, item.permission))
  const currentPermission = permissionFromPath(path)
  const hasAccess = currentPermission ? canAccess(session.role, currentPermission) : true
  const active = allowedItems.find((item) => item.permission === currentPermission)

  const goHome = () => {
    const first = allowedItems[0]
    window.location.assign(first ? first.path : '/dashboard')
  }

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <Brand />
        <button className="mobile-close" onClick={closeSidebar} aria-label="Tutup menu"><X aria-hidden="true" /></button>

        <div className="side-label">MENU UTAMA</div>
        <nav className="nav-list" aria-label="Navigasi utama">
          {allowedItems.map(({ path: itemPath, label, icon: Icon, permission }) => (
            <Link
              key={itemPath}
              href={itemPath}
              className={`nav-item ${path === itemPath ? 'active' : ''}`}
              aria-current={path === itemPath ? 'page' : undefined}
              onClick={closeSidebar}
            >
              <Icon aria-hidden="true" /><span>{label}</span>
              {permission === 'obat' && <b>5</b>}
            </Link>
          ))}
        </nav>

        <div className="side-label side-label-bottom">AKUN</div>
        <div className="profile-menu">
          <button
            className="user-card"
            onClick={() => setProfileOpen((open) => !open)}
            aria-expanded={profileOpen}
            aria-haspopup="menu"
            aria-label="Buka menu profil pengguna"
          >
            <div className="avatar">{initialsOf(session.name)}</div>
            <div>
              <strong>{session.name}</strong>
              <span>{session.role}</span>
            </div>
            <ChevronDown aria-hidden="true" />
          </button>

          {profileOpen && (
            <div className="profile-popover" role="menu" aria-label="Menu profil pengguna">
              <div className="profile-popover-head">
                <strong>{session.name}</strong>
                <span>{session.email}</span>
                <span className="profile-role"><ShieldCheck aria-hidden="true" />{session.role}</span>
              </div>
              <button className="profile-logout" role="menuitem" onClick={logout}>
                <LogOut aria-hidden="true" />Keluar / Logout
              </button>
            </div>
          )}
        </div>
      </aside>

      {sidebarOpen && <button className="sidebar-backdrop" aria-label="Tutup sidebar" onClick={closeSidebar} />}

      <main className="main-content">
        <header className="topbar">
          <button className="menu-button" onClick={() => setSidebarOpen(true)} aria-label="Buka menu"><Menu aria-hidden="true" /></button>
          <div className="breadcrumbs">
            <span>Workspace</span><strong>/</strong>
            <b>{active ? active.label : (currentPermission ? 'Akses ditolak' : 'Dashboard')}</b>
          </div>

          {/*
            Semua kontrol kanan dikelompokkan dalam satu wrapper supaya urutannya
            dikendalikan oleh satu aturan, bukan oleh "space-between" pada
            .topbar yang membuat tiap anak tersebar ke seluruh lebar.
          */}
          <div className="topbar-actions">
            <ThemeToggle />
            <div className="notification-menu">
              <button
                className="icon-button notification-button"
                onClick={() => setNotificationOpen((open) => !open)}
                aria-label={`Notifikasi, ${NOTIFICATIONS.length} belum dibaca`}
                aria-expanded={notificationOpen}
              >
                <Bell aria-hidden="true" />
                <span className="notification-dot" role="status" aria-atomic="true">
                  <span className="sr-only">{NOTIFICATIONS.length} notifikasi belum dibaca</span>
                  <span aria-hidden="true">{NOTIFICATIONS.length}</span>
                </span>
              </button>
              {notificationOpen && (
                <div className="notification-popover" role="dialog" aria-label="Notifikasi penting">
                  <div className="notification-popover-header">
                    <div><strong>Notifikasi</strong><span>Perlu perhatian hari ini</span></div>
                    <button className="link-button" onClick={() => setNotificationOpen(false)}>Tandai dibaca</button>
                  </div>
                  <NotificationList items={NOTIFICATIONS} />
                  <button className="notification-footer" onClick={() => setNotificationOpen(false)}>
                    Lihat semua <Plus aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>

            <div className="top-avatar" title={session.name}>{initialsOf(session.name)}</div>
          </div>
        </header>

        <div className="page-wrap">
          {hasAccess ? children : <AccessDenied session={session} onGoHome={goHome} />}
        </div>
      </main>
    </div>
  )
}