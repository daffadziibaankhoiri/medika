'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import {
  AlertTriangle, Bell, Boxes, CalendarDays, ClipboardList, FileText, LayoutDashboard, Lock,
  LogOut, Menu, PackageCheck, Plus, Settings, ShieldCheck, ShieldX, ShoppingCart, Truck, X,
  ChevronDown,
} from 'lucide-react'
import { clearSession, initialsOf, readSession, type Session } from '@/lib/auth'
import { canAccess, permissionFromPath, type Permission } from '@/lib/permissions'
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
]

/**
 * Notifikasi topbar.
 *
 * Jumlah pada badge dihitung dari isi daftar, bukan angka yang ditulis manual,
 * supaya badge dan isi popover tidak pernah berbeda.
 */
const NOTIFICATIONS = [
  { tone: 'danger', icon: <AlertTriangle aria-hidden="true" />, title: '2 obat sudah Kadaluwarsa', body: 'Amoxicillin 500mg perlu dipisahkan dari stok aktif.', time: 'Baru saja' },
  { tone: 'warning', icon: <CalendarDays aria-hidden="true" />, title: '10 obat mendekati kedaluwarsa', body: 'Segera buat rencana retur atau penyesuaian stok.', time: '2 jam lalu' },
  { tone: 'info', icon: <Boxes aria-hidden="true" />, title: '5 stok obat menipis', body: 'Di bawah batas minimum, siapkan pesanan baru.', time: 'Hari ini' },
]

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
  const [path, setPath] = useState('/dashboard')

  useEffect(() => {
    setPath(window.location.pathname || '/dashboard')
    const current = readSession()
    setSession(current)
    setSessionChecked(true)
    if (!current) window.location.assign('/login')
  }, [])

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname || '/dashboard')
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const logout = () => {
    clearSession()
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
                  <div className="notification-items">
                    {NOTIFICATIONS.map((item) => (
                      <div key={item.title} className={`notification-item ${item.tone}`}>
                        <div className="notification-icon">{item.icon}</div>
                        <div><strong>{item.title}</strong><span>{item.body}</span><small>{item.time}</small></div>
                      </div>
                    ))}
                  </div>
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