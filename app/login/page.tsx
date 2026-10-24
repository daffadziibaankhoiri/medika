'use client'

import { useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { AlertCircle, ArrowRight, CheckCircle2, Clock, Eye, EyeOff, Info, Lock, ShieldAlert } from 'lucide-react'
import {
  authenticate,
  initialsOf,
  readLoginNotice,
  writeSession,
} from '@/lib/auth'
import { defaultPathForRole } from '@/lib/permissions'
import { DEMO_ACCOUNT_HINTS, type AccountStatus } from '@/lib/users'
import Logo from '@/components/logo'
import { ThemeToggle } from '@/components/theme-toggle'

const STATUS_LABEL: Record<AccountStatus, string> = {
  aktif: 'Aktif',
  nonaktif: 'Nonaktif',
  menunggu: 'Menunggu',
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Pesan ini muncul kalau sesi pengguna berakhir karena akunnya dinonaktifkan
  // atau ditolak Owner saat sedang memakai aplikasi.
  useEffect(() => {
    setNotice(readLoginNotice())
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('Email dan password wajib diisi.')
      return
    }

    setSubmitting(true)
    const result = await authenticate(email, password)

    if (!result.ok) {
      setError(result.message)
      setSubmitting(false)
      return
    }

    await writeSession(result.session)
    // Muat ulang penuh (bukan pushState) supaya cookie pasti dibaca proxy.
    // Arahkan ke halaman pertama yang diizinkan role tersebut.
    window.location.assign(defaultPathForRole(result.session.role))
  }

  function fillDemo(demoEmail: string, demoPassword: string) {
    setEmail(demoEmail)
    setPassword(demoPassword)
    setError('')
    setNotice(null)
  }

  return (
    <main className="auth-page">
      {/* Halaman login tidak punya topbar, jadi tombol temanya menempel di
          sudut kanan atas halaman. */}
      <div className="auth-theme"><ThemeToggle /></div>

      <div className="auth-shell">
        <section className="auth-aside" aria-label="Tentang aplikasi HealTI">
          <Logo size={48} onDark />

          <h1>Kelola apotek dengan lebih rapi dan aman.</h1>
          <p>Satu tempat untuk memantau stok obat, transaksi, hingga laporan penjualan apotek Anda.</p>

          <ul className="auth-points">
            <li><CheckCircle2 aria-hidden="true" /> Stok obat terpantau real-time</li>
            <li><CheckCircle2 aria-hidden="true" /> Transaksi kasir lebih cepat</li>
            <li><CheckCircle2 aria-hidden="true" /> Laporan penjualan otomatis</li>
          </ul>

          <p className="auth-aside-foot">© 2026 HealTI · Sistem Manajemen Apotek</p>
        </section>

        <section className="auth-form-wrap">
          <div className="auth-heading">
            <h2>Masuk ke akun Anda</h2>
            <p>Gunakan email dan password yang terdaftar untuk mengakses dashboard apotek.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label className="auth-label" htmlFor="login-email">Email</label>
              <div className="auth-input-wrap">
                <input
                  className="auth-input"
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  placeholder="contoh@healti.id"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
            </div>
            <div className="auth-field">
              <label className="auth-label" htmlFor="login-password">Password</label>
              <div className="auth-input-wrap">
                <input
                  className="auth-input has-toggle"
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Masukkan password Anda"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <button
                  type="button"
                  className="auth-toggle"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                </button>
              </div>
            </div>

            <button className="auth-submit" type="submit" disabled={submitting}>
              {submitting ? 'Memproses…' : 'Masuk'}
              {!submitting && <ArrowRight aria-hidden="true" />}
            </button>

            {/* Satu blok pesan error di bawah form, diumumkan lewat aria-live. */}
            <div aria-live="assertive" aria-atomic="true">
              {error && (
                <p className="auth-message error">
                  <AlertCircle aria-hidden="true" />
                  <span>{error}</span>
                </p>
              )}
            </div>

            <div aria-live="polite" aria-atomic="true">
              {notice && (
                <p className="auth-message info">
                  <ShieldAlert aria-hidden="true" />
                  <span>{notice}</span>
                </p>
              )}
            </div>
          </form>

          <p className="auth-alt">
            Belum punya akun? <Link className="auth-link" href="/register">Daftar di sini</Link>
          </p>

          <section className="auth-demo" aria-labelledby="demo-heading">
            <h3 className="auth-demo-head" id="demo-heading">
              <Info aria-hidden="true" /> AKUN DEMO — KLIK UNTUK MENGISI OTOMATIS
            </h3>
            <p>Akun berikut adalah akun demonstrasi bawaan. Klik salah satu untuk mengisi form di atas.</p>
            <div className="auth-demo-list">
              {DEMO_ACCOUNT_HINTS.map((account) => (
                <button
                  key={account.id}
                  type="button"
                  className="auth-demo-item"
                  onClick={() => fillDemo(account.email, account.password)}
                  aria-label={`Isi form dengan akun demo ${account.role}, ${account.email}, status ${STATUS_LABEL[account.status]}`}
                >
                  <span className="auth-demo-avatar" aria-hidden="true">{initialsOf(account.name)}</span>
                  <span className="auth-demo-copy">
                    <strong>{account.name}</strong>
                    <span>{account.email} · {account.password}</span>
                  </span>
                  <span className="auth-demo-role">
                    {account.status === 'aktif' ? (
                      account.role
                    ) : (
                      <>
                        {account.status === 'menunggu' ? <Clock aria-hidden="true" /> : <Lock aria-hidden="true" />}
                        {STATUS_LABEL[account.status]}
                      </>
                    )}
                  </span>
                </button>
              ))}
            </div>
          </section>
        </section>
      </div>
    </main>
  )
}
