'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff, Info, Plus } from 'lucide-react'
import { authenticate, DEMO_ACCOUNTS, initialsOf, writeSession } from '@/lib/auth'
import { defaultPathForRole } from '@/lib/permissions'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('Email dan password wajib diisi.')
      return
    }

    setSubmitting(true)
    const session = authenticate(email, password)

    if (!session) {
      // Sengaja tidak membedakan "email tidak terdaftar" dan "password salah".
      setError('Email atau password salah. Silakan periksa kembali data Anda.')
      setSubmitting(false)
      return
    }

    writeSession(session)
    // Muat ulang penuh (bukan pushState) supaya cookie pasti dibaca proxy.
    // Arahkan ke halaman pertama yang diizinkan role tersebut.
    window.location.assign(defaultPathForRole(session.role))
  }

  function fillDemo(demoEmail: string, demoPassword: string) {
    setEmail(demoEmail)
    setPassword(demoPassword)
    setError('')
  }

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <section className="auth-aside" aria-label="Tentang aplikasi HealTI">
          <div className="auth-brand">
            <div className="auth-brand-mark"><Plus aria-hidden="true" /></div>
            <div>
              <strong>HealTI</strong>
              <span>APOTEK SEHAT</span>
            </div>
          </div>

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
                  autoComplete="email"
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
          </form>

          <p className="auth-alt">
            Belum punya akun?{' '}
            <Link className="auth-link" href="/register">Daftar di sini</Link>
          </p>

          <section className="auth-demo" aria-labelledby="demo-heading">
            <h3 className="auth-demo-head" id="demo-heading">
              <Info aria-hidden="true" /> AKUN DEMO — KLIK UNTUK MENGISI OTOMATIS
            </h3>
            <p>Akun berikut adalah akun demonstrasi bawaan. Klik salah satu untuk mengisi form di atas.</p>

            <div className="auth-demo-list">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  className="auth-demo-item"
                  onClick={() => fillDemo(account.email, account.password)}
                  aria-label={`Isi form dengan akun demo ${account.role}, email ${account.email}`}
                >
                  <span className="auth-demo-avatar" aria-hidden="true">{initialsOf(account.name)}</span>
                  <span className="auth-demo-copy">
                    <strong>{account.name}</strong>
                    <span>{account.email} · {account.password}</span>
                  </span>
                  <span className="auth-demo-role">{account.role}</span>
                </button>
              ))}
            </div>
          </section>
        </section>
      </div>
    </main>
  )
}