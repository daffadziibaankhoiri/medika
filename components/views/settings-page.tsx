'use client'

import { useState } from 'react'
import { CheckCircle2, Download } from 'lucide-react'
import { Button, Field } from '@/components/ui'
import { PageIntro } from '@/components/page-intro'
import NotifikasiKedaluwarsa from '@/components/views/notifikasi-kedaluwarsa'

type Profil = {
  apotek: string
  pemilik: string
  alamat: string
  telepon: string
  email: string
  lisensi: string
  jam_buka: string
  jam_tutup: string
}

const AWAL: Profil = {
  apotek: 'Apotek Sehat Sejahtera',
  pemilik: 'Kelompok 5',
  alamat: 'Jl. Merdeka No. 42, Jakarta',
  telepon: '021-555-1234',
  email: 'kelompok5@apotek.com',
  lisensi: 'APT-2026-001234',
  jam_buka: '08:00',
  jam_tutup: '20:00',
}

export function SettingsPage() {
  const [profil, setProfil] = useState<Profil>(AWAL)
  const [tersimpan, setTersimpan] = useState(false)

  // Disimpan tetap dihitung dari state, jadi teks "tersimpan" muncul kembali
  // setiap kali ada perubahan baru — bukan sekali seumur halaman.
  function simpan() {
    setTersimpan(true)
    window.setTimeout(() => setTersimpan(false), 2500)
  }

  const ubah = <K extends keyof Profil>(key: K, value: Profil[K]) =>
    setProfil((current) => ({ ...current, [key]: value }))

  return (
    <>
      <PageIntro
        title="Pengaturan Apotek"
        subtitle="Kelola informasi profil apotek, jam operasional, dan preferensi sistem."
      />

      <section className="panel settings-panel">
        <h2>Informasi Apotek</h2>
        <p className="panel-note">Data dasar identitas dan kontak apotek</p>
        <div className="settings-grid">
          <Field label="Nama Apotek" htmlFor="s-apotek">
            <input id="s-apotek" value={profil.apotek} onChange={(e) => ubah('apotek', e.target.value)} placeholder="Nama apotek" />
          </Field>
          <Field label="Nama Pemilik" htmlFor="s-pemilik">
            <input id="s-pemilik" value={profil.pemilik} onChange={(e) => ubah('pemilik', e.target.value)} placeholder="Nama pemilik" />
          </Field>
          <Field label="Alamat Lengkap" htmlFor="s-alamat">
            <input id="s-alamat" value={profil.alamat} onChange={(e) => ubah('alamat', e.target.value)} placeholder="Alamat apotek" />
          </Field>
          <Field label="Telepon" htmlFor="s-telepon">
            <input id="s-telepon" type="tel" value={profil.telepon} onChange={(e) => ubah('telepon', e.target.value)} placeholder="Nomor telepon" />
          </Field>
          <Field label="Email" htmlFor="s-email">
            <input id="s-email" type="email" value={profil.email} onChange={(e) => ubah('email', e.target.value)} placeholder="Email bisnis" />
          </Field>
          <Field label="No. Lisensi Apotek" htmlFor="s-lisensi">
            <input id="s-lisensi" value={profil.lisensi} onChange={(e) => ubah('lisensi', e.target.value)} placeholder="Nomor lisensi apotek" />
          </Field>
        </div>
      </section>

      <section className="panel settings-panel">
        <h2>Jam Operasional</h2>
        <p className="panel-note">Atur jam buka dan tutup apotek</p>
        <div className="settings-grid">
          <Field label="Jam Buka" htmlFor="s-buka">
            <input id="s-buka" type="time" value={profil.jam_buka} onChange={(e) => ubah('jam_buka', e.target.value)} />
          </Field>
          <Field label="Jam Tutup" htmlFor="s-tutup">
            <input id="s-tutup" type="time" value={profil.jam_tutup} onChange={(e) => ubah('jam_tutup', e.target.value)} />
          </Field>
        </div>
      </section>

      <NotifikasiKedaluwarsa />

      <section className="panel settings-panel">
        <h2>Keamanan & Akun</h2>
        <p className="panel-note">Kelola keamanan dan akses sistem</p>
        <div className="settings-list">
          <div className="settings-item">
            <div>
              <strong>Password Akun</strong>
              <span>Ubah password login sistem</span>
            </div>
            <button type="button" className="outline-button">Ubah Password</button>
          </div>
          <div className="settings-item">
            <div>
              <strong>Backup Data</strong>
              <span>Buat backup database apotek</span>
            </div>
            <button type="button" className="outline-button"><Download aria-hidden="true" /> Backup Sekarang</button>
          </div>
          <div className="settings-item">
            <div>
              <strong>Notifikasi Sistem</strong>
              <span>Atur preferensi notifikasi</span>
            </div>
            <button type="button" className="outline-button">Pengaturan Notifikasi</button>
          </div>
        </div>
      </section>

      <div className="settings-actions">
        {/* Live region supaya konfirmasi tersimpan terdengar pembaca layar
            tanpa harus memindahkan fokus ke tombol. */}
        <span className="save-indicator" role="status" aria-live="polite" aria-atomic="true">
          {tersimpan && (
            <>
              <CheckCircle2 aria-hidden="true" /> Pengaturan tersimpan
            </>
          )}
        </span>
        <Button onClick={simpan}>Simpan Pengaturan</Button>
      </div>
    </>
  )
}