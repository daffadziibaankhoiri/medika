'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight, Boxes, ClipboardList, FileText, Lock, LogIn, Receipt, ShieldCheck, TrendingUp,
} from 'lucide-react'
import Logo from '@/components/logo'

const FITUR = [
  { icon: TrendingUp, judul: 'Ringkasan Real-time', teks: 'Penjualan, stok, dan obat mendekati kedaluwarsa diperbarui setiap hari.' },
  { icon: Boxes, judul: 'Manajemen Obat', teks: 'Lacak stok per batch, tanggal masuk, dan status FEFO tiap obat.' },
  { icon: Receipt, judul: 'Kasir FEFO', teks: 'Batch terdekat yang belum kedaluwarsa dipilih otomatis saat transaksi.' },
  { icon: ClipboardList, judul: 'Stock Opname', teks: 'Cocokkan stok sistem dengan stok fisik dan ajukan adjustment.' },
  { icon: FileText, judul: 'Laporan Penjualan', teks: 'Analisis performa penjualan per periode, lengkap dengan pertumbuhan.' },
  { icon: ShieldCheck, judul: 'Akses Berbasis Role', teks: 'Owner, Apoteker, dan Staff dengan hak akses yang berbeda.' },
]

export function Landing({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="landing-page">
      <header className="landing-topbar">
        <Link href="/" className="landing-logo-link" aria-label="HealTI — beranda">
          <Logo size={44} />
        </Link>
        <nav className="landing-nav" aria-label="Navigasi utama">
          <a href="#fitur">Fitur</a>
          <Link className="auth-link" href="/login">Masuk</Link>
          <Link className="landing-nav-cta" href="/register">Daftar Akun</Link>
        </nav>
      </header>

      <main className="landing-main">
        {/* Hero: teks di kiri, foto apotek di kanan */}
        <section className="landing-hero">
          <div className="landing-hero-copy">
            <p className="landing-badge">
              <ShieldCheck aria-hidden="true" /> Sistem manajemen apotek terpadu
            </p>

            <h1>
              Kelola apotek <span>lebih rapi</span>,<br />
              jualan lebih cepat.
            </h1>

            <p className="landing-lead">
              Pantau stok obat, proses transaksi kasir, cocokkan stok opname, dan
              pantau laporan penjualan — semuanya dalam satu aplikasi.
            </p>

            <div className="landing-actions">
              <button className="landing-primary" onClick={onEnter}>
                <LogIn aria-hidden="true" /> Masuk ke Aplikasi
              </button>
              <Link className="landing-secondary" href="/register">
                Daftar Akun Baru <ArrowRight aria-hidden="true" />
              </Link>
            </div>

            <ul className="landing-trust">
              <li><Lock aria-hidden="true" /> Akses per role</li>
              <li><ShieldCheck aria-hidden="true" /> Batch &amp; FEFO terlacak</li>
              <li><FileText aria-hidden="true" /> Laporan siap cetak</li>
            </ul>
          </div>

          <div className="landing-hero-media">
            <div className="landing-photo">
              <Image
                src="/pharmacy-hero.jpg"
                alt="Interior apotek HealTI dengan rak-rak obat tertata dan meja layanan"
                width={735}
                height={490}
                priority
              />
            </div>

            <div className="landing-stat-card landing-stat-1">
              <strong>1.284</strong>
              <span>unit obat terdaftar</span>
            </div>
            <div className="landing-stat-card landing-stat-2">
              <span className="landing-dot" aria-hidden="true" />
              <strong>92%</strong>
              <span>stok kadaluwarsa terlawan</span>
            </div>
          </div>
        </section>

        {/* Fitur */}
        <section className="landing-features-section" id="fitur" aria-labelledby="fitur-judul">
          <h2 id="fitur-judul">Semua yang dibutuhkan apotek dalam satu tempat</h2>
          <p className="landing-features-sub">
            Dirancang untuk Owner, Apoteker, dan Staff Administrasi.
          </p>

          <div className="landing-features">
            {FITUR.map(({ icon: Icon, judul, teks }) => (
              <article className="landing-feature" key={judul}>
                <span className="landing-feature-icon"><Icon aria-hidden="true" /></span>
                <strong>{judul}</strong>
                <span>{teks}</span>
              </article>
            ))}
          </div>
        </section>

        {/* CTA penutup */}
        <section className="landing-cta">
          <div>
            <h2>Siap mulai kelola apotek lebih rapi?</h2>
            <p>Masuk dengan akun Anda atau daftar akun baru dan tunggu persetujuan Owner.</p>
          </div>
          <div className="landing-actions">
            <button className="landing-primary" onClick={onEnter}>Masuk Sekarang</button>
            <Link className="landing-cta-ghost" href="/register">Daftar Akun Baru</Link>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <Logo size={36} />
        <p>© 2026 HealTI · Sistem Manajemen Apotek</p>
      </footer>
    </div>
  )
}