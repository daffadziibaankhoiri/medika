'use client'

import { ClipboardList, Plus, TrendingUp, UserCheck } from 'lucide-react'

export function Landing({ onEnter }: { onEnter: () => void }) {
  return <div className="landing-page">
    <header className="landing-topbar">
      <div className="auth-brand">
        <div className="auth-brand-mark"><Plus aria-hidden="true" /></div>
        <div><strong>medika</strong><span>APOTEK SEHAT</span></div>
      </div>
    </header>
    <div className="landing-hero"><div className="landing-hero-inner">
      <h1>Sistem manajemen apotek <span>yang lebih rapi</span>.</h1>
      <p>Pantau stok obat, proses transaksi kasir, kelola supplier, dan laporan penjualan dalam satu aplikasi.</p>
      <div className="landing-actions">
        <button className="landing-primary" onClick={onEnter}>Masuk ke Aplikasi</button>
        <button className="landing-secondary" onClick={() => { window.location.assign('/register') }}>Daftar Akun Baru</button>
      </div>
      <div className="landing-features">
        <div className="landing-feature"><TrendingUp aria-hidden="true" /><strong>Ringkasan Real-time</strong><span>Statistik penjualan dan stok diperbarui setiap hari.</span></div>
        <div className="landing-feature"><ClipboardList aria-hidden="true" /><strong>Manajemen Obat</strong><span>Kelola persediaan, harga, dan tanggal kadaluarsa.</span></div>
        <div className="landing-feature"><UserCheck aria-hidden="true" /><strong>Akses Berbasis Role</strong><span>Owner, Apoteker, dan Staff dengan hak berbeda.</span></div>
      </div>
    </div></div>
  </div>
}