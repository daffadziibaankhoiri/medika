'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { AlertCircle, CheckCircle2, Clock, Eye, EyeOff, Plus } from 'lucide-react'
import {
  DEFAULT_NEW_ACCOUNT_ROLE,
  isValidEmail,
  MIN_PASSWORD_LENGTH,
} from '@/lib/auth'
import Logo from '@/components/logo'
import { ThemeToggle } from '@/components/theme-toggle'

type Errors = Partial<Record<'name' | 'email' | 'password' | 'confirmPassword', string>>

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [registered, setRegistered] = useState(false)

  function validate(): Errors {
    const next: Errors = {}

    if (!name.trim()) next.name = 'Nama lengkap wajib diisi.'
    else if (name.trim().length < 3) next.name = 'Nama lengkap minimal 3 karakter.'

    if (!email.trim()) next.email = 'Email wajib diisi.'
    else if (!isValidEmail(email)) next.email = 'Format email tidak valid. Contoh: nama@healti.id'

    if (!password) next.password = 'Password wajib diisi.'
    else if (password.length < MIN_PASSWORD_LENGTH) {
      next.password = `Password minimal ${MIN_PASSWORD_LENGTH} karakter.`
    }

    if (!confirmPassword) next.confirmPassword = 'Konfirmasi password wajib diisi.'
    else if (password !== confirmPassword) next.confirmPassword = 'Konfirmasi password tidak sama dengan password.'

    return next
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    // DEMO: tidak ada database. Akun baru sengaja tidak dibuatkan sesi dan
    // tidak dapat login sampai disetujui Owner.
    setRegistered(true)
  }

  if (registered) {
    return (
      <main className="auth-page">
        <div className="auth-theme"><ThemeToggle /></div>
        <div className="auth-shell">
          <section className="auth-aside" aria-label="Tentang aplikasi HealTI">
            <Logo size={48} onDark />
            <h1>Pendaftaran berhasil dikirim.</h1>
            <p>Akun Anda sudah tercatat dan sedang menunggu persetujuan dari Owner apotek.</p>
            <ul className="auth-points">
              <li><CheckCircle2 aria-hidden="true" /> Data Anda sudah tersimpan</li>
              <li><CheckCircle2 aria-hidden="true" /> Role ditetapkan otomatis oleh sistem</li>
              <li><CheckCircle2 aria-hidden="true" /> Aktif setelah disetujui Owner</li>
            </ul>
            <p className="auth-aside-foot">© 2026 HealTI · Sistem Manajemen Apotek</p>
          </section>

          <section className="auth-form-wrap">
            <div className="auth-heading">
              <h2>Menunggu persetujuan Owner</h2>
              <p>Akun Anda belum dapat digunakan untuk masuk ke aplikasi.</p>
            </div>

            <div role="status" aria-live="polite">
              <div className="auth-success-box">
                <div className="auth-success-icon"><CheckCircle2 aria-hidden="true" /></div>
                <h3>Akun {name.trim()} berhasil didaftarkan</h3>
                <p>
                  Akun baru otomatis berstatus <strong>{DEFAULT_NEW_ACCOUNT_ROLE}, menunggu persetujuan Owner</strong>.
                  Demi keamanan, akun belum bisa dipakai untuk masuk sampai disetujui oleh Owner apotek.
                </p>

                <span className="auth-badge-pending">
                  <Clock aria-hidden="true" /> Menunggu persetujuan Owner
                </span>

                <ul>
                  <li>Email akun: <strong>{email.trim()}</strong></li>
                  <li>Role yang diberikan: <strong>{DEFAULT_NEW_ACCOUNT_ROLE}</strong></li>
                  <li>Status: <strong>Belum aktif</strong></li>
                </ul>
              </div>
            </div>

            <p className="auth-alt">
              Sudah disetujui?{' '}
              <Link className="auth-link" href="/login">Kembali ke halaman masuk</Link>
            </p>
          </section>
        </div>
      </main>
    )
  }

  return (
    <main className="auth-page">
      <div className="auth-theme"><ThemeToggle /></div>
      <div className="auth-shell">
        <section className="auth-aside" aria-label="Tentang aplikasi HealTI">
          <Logo size={48} onDark />

          <h1>Buat akun untuk tim apotek Anda.</h1>
          <p>Setiap akun baru akan berstatus Staff Administrasi dan menunggu persetujuan Owner sebelum dapat digunakan.</p>

          <ul className="auth-points">
            <li><CheckCircle2 aria-hidden="true" /> Role ditetapkan otomatis</li>
            <li><CheckCircle2 aria-hidden="true" /> Tidak perlu memilih role saat daftar</li>
            <li><CheckCircle2 aria-hidden="true" /> Diaktifkan setelah disetujui Owner</li>
          </ul>

          <p className="auth-aside-foot">© 2026 HealTI · Sistem Manajemen Apotek</p>
        </section>

        <section className="auth-form-wrap">
          <div className="auth-heading">
            <h2>Daftar akun baru</h2>
            <p>Isi data berikut untuk membuat akun. Role akan ditetapkan otomatis oleh sistem.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label className="auth-label" htmlFor="register-name">Nama lengkap</label>
              <div className="auth-input-wrap">
                <input
                  className="auth-input"
                  id="register-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Contoh: Andi Wijaya"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  aria-invalid={errors.name ? true : undefined}
                  aria-describedby={errors.name ? 'register-name-error' : undefined}
                  required
                />
              </div>
              {errors.name && (
                <p className="auth-field-error" id="register-name-error">
                  <AlertCircle aria-hidden="true" /> <span>{errors.name}</span>
                </p>
              )}
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="register-email">Email</label>
              <div className="auth-input-wrap">
                <input
                  className="auth-input"
                  id="register-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="contoh@healti.id"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  aria-invalid={errors.email ? true : undefined}
                  aria-describedby={errors.email ? 'register-email-error' : undefined}
                  required
                />
              </div>
              {errors.email && (
                <p className="auth-field-error" id="register-email-error">
                  <AlertCircle aria-hidden="true" /> <span>{errors.email}</span>
                </p>
              )}
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="register-password">Password</label>
              <div className="auth-input-wrap">
                <input
                  className="auth-input has-toggle"
                  id="register-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder={`Minimal ${MIN_PASSWORD_LENGTH} karakter`}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  aria-invalid={errors.password ? true : undefined}
                  aria-describedby={errors.password ? 'register-password-error' : 'register-password-hint'}
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
              {errors.password ? (
                <p className="auth-field-error" id="register-password-error">
                  <AlertCircle aria-hidden="true" /> <span>{errors.password}</span>
                </p>
              ) : (
                <p className="auth-hint" id="register-password-hint">
                  Gunakan kombinasi huruf dan angka, minimal {MIN_PASSWORD_LENGTH} karakter.
                </p>
              )}
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="register-confirm">Konfirmasi password</label>
              <div className="auth-input-wrap">
                <input
                  className="auth-input has-toggle"
                  id="register-confirm"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Ulangi password Anda"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  aria-invalid={errors.confirmPassword ? true : undefined}
                  aria-describedby={errors.confirmPassword ? 'register-confirm-error' : undefined}
                  required
                />
                <button
                  type="button"
                  className="auth-toggle"
                  onClick={() => setShowConfirmPassword((current) => !current)}
                  aria-label={showConfirmPassword ? 'Sembunyikan konfirmasi password' : 'Tampilkan konfirmasi password'}
                  aria-pressed={showConfirmPassword}
                >
                  {showConfirmPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="auth-field-error" id="register-confirm-error">
                  <AlertCircle aria-hidden="true" /> <span>{errors.confirmPassword}</span>
                </p>
              )}
            </div>

            <button className="auth-submit" type="submit">
              Buat akun
            </button>
          </form>

          <p className="auth-alt">
            Sudah punya akun?{' '}
            <Link className="auth-link" href="/login">Masuk di sini</Link>
          </p>
        </section>
      </div>
    </main>
  )
}