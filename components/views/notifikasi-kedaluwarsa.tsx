'use client'

import { useState } from 'react'
import { AlertTriangle, BellRing, CheckCircle2, Clock, Send } from 'lucide-react'
import { Field } from '@/components/ui'

/** Kanal notifikasi yang didukung. */
const KANAL = [
  { id: 'whatsapp', label: 'WhatsApp', contoh: '6281234567890' },
  { id: 'sms', label: 'SMS', contoh: '081234567890' },
  { id: 'email', label: 'Email', contoh: 'notifikasi@apotek.com' },
] as const

/** Ambang hari sebelum kedaluwarsa. */
const AMBANG = [90, 60, 30] as const

export default function NotifikasiKedaluwarsa() {
  const [ambang, setAmbang] = useState<number>(60)
  const [kanal, setKanal] = useState<string>('whatsapp')
  const [nomor, setNomor] = useState('6281234567890')
  const [aktif, setAktif] = useState(true)
  const [jam, setJam] = useState('08:00')
  const [hari, setHari] = useState<string[]>(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'])
  const [tes, setTes] = useState<{ tone: 'success' | 'error'; teks: string } | null>(null)
  const [riwayat, setRiwayat] = useState<{ waktu: string; isi: string }[]>([])

  const contoh = KANAL.find((k) => k.id === kanal)?.contoh ?? ''

  function kirimTes() {
    const target = nomor.trim()
    if (!aktif) {
      return setTes({ tone: 'error', teks: 'Notifikasi kedaluwarsa sedang dinonaktifkan.' })
    }
    if (!target) {
      return setTes({ tone: 'error', teks: 'Nomor tujuan wajib diisi sebelum mengirim tes.' })
    }
    if (kanal === 'email' && !target.includes('@')) {
      return setTes({ tone: 'error', teks: 'Format email tidak valid. Contoh: notifikasi@apotek.com' })
    }
    if (kanal !== 'email' && !/^[0-9+\-\s]{8,}$/.test(target)) {
      return setTes({ tone: 'error', teks: 'Nomor tujuan tidak valid untuk kanal ini.' })
    }

    const labelKanal = KANAL.find((k) => k.id === kanal)!.label
    const waktu = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
    const isi =
      `Tes notifikasi HealTI. Apotek akan mengirim pengingat untuk obat yang kadaluwarsa ` +
      `dalam ${ambang} hari ke depan melalui ${labelKanal}.`

    setRiwayat((current) => [{ waktu, isi }, ...current])
    setTes({ tone: 'success', teks: `Pesan tes berhasil dikirim ke ${target} melalui ${labelKanal}.` })
  }

  const toggleHari = (h: string) => {
    setHari((current) => (current.includes(h) ? current.filter((x) => x !== h) : [...current, h]))
  }

  return (
    <section className="panel settings-panel notifikasi-panel">
      <div className="panel-header">
        <div>
          <h2><BellRing aria-hidden="true" /> Notifikasi Kedaluwarsa</h2>
          <p className="panel-note">Kirim pengingat otomatis sebelum tanggal kedaluwarsa obat.</p>
        </div>
        <label className="switch">
          <input
            type="checkbox"
            checked={aktif}
            onChange={(e) => setAktif(e.target.checked)}
          />
          <span>{aktif ? 'Aktif' : 'Nonaktif'}</span>
        </label>
      </div>

      <div className="notifikasi-grid">
        <fieldset className="fieldset">
          <legend>Ambang pengingat</legend>
          <p className="fieldset-hint">Kirim notifikasi berapa hari sebelum obat kedaluwarsa.</p>
          <div className="pilihan-grup" role="radiogroup" aria-label="Ambang hari notifikasi">
            {AMBANG.map((hariAmbang) => (
              <label key={hariAmbang} className={`pilihan ${ambang === hariAmbang ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="ambang"
                  value={hariAmbang}
                  checked={ambang === hariAmbang}
                  onChange={() => setAmbang(hariAmbang)}
                />
                {hariAmbang} hari
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="fieldset">
          <legend>Kanal pengiriman</legend>
          <p className="fieldset-hint">Pilih kanal yang dipakai untuk mengirim notifikasi.</p>
          <div className="pilihan-grup" role="radiogroup" aria-label="Kanal notifikasi">
            {KANAL.map((item) => (
              <label key={item.id} className={`pilihan ${kanal === item.id ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="kanal"
                  value={item.id}
                  checked={kanal === item.id}
                  onChange={() => setKanal(item.id)}
                />
                {item.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="fieldset">
          <label className="fieldset-label" htmlFor="notifikasi-nomor">Nomor tujuan</label>
          <p className="fieldset-hint">
            {kanal === 'email' ? 'Alamat email penerima notifikasi.' : 'Nomor penerima notifikasi (format internasional).'}
          </p>
          <input
            id="notifikasi-nomor"
            type={kanal === 'email' ? 'email' : 'tel'}
            value={nomor}
            onChange={(e) => setNomor(e.target.value)}
            placeholder={contoh}
          />
        </div>

        <fieldset className="fieldset">
          <legend>Jadwal pengiriman harian</legend>
          <p className="fieldset-hint">Pilih hari dan jam notifikasi dikirim otomatis.</p>
          <div className="hari-grup">
            {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map((h) => (
              <button
                key={h}
                type="button"
                className={`chip ${hari.includes(h) ? 'active' : ''}`}
                onClick={() => toggleHari(h)}
                aria-pressed={hari.includes(h)}
              >
                {h}
              </button>
            ))}
          </div>
          <div className="jam-row">
            <Field label="Jam kirim" htmlFor="notifikasi-jam">
              <input
                id="notifikasi-jam"
                type="time"
                value={jam}
                onChange={(e) => setJam(e.target.value)}
              />
            </Field>
            <p className="jam-ringkas"><Clock aria-hidden="true" /> {hari.length} hari dipilih · pukul {jam}</p>
          </div>
        </fieldset>
      </div>

      <div aria-live="assertive" aria-atomic="true">
        {tes && (
          <p className={`auth-message ${tes.tone}`} style={{ marginTop: 16 }}>
            {tes.tone === 'success'
              ? <CheckCircle2 aria-hidden="true" />
              : <AlertTriangle aria-hidden="true" />}
            <span>{tes.teks}</span>
          </p>
        )}
      </div>

      <div className="settings-actions">
        <button className="primary-button" type="button" onClick={kirimTes}>
          <Send aria-hidden="true" /> Kirim Tes Notifikasi
        </button>
      </div>

      {riwayat.length > 0 && (
        <div className="tes-riwayat">
          <h3>Riwayat Tes Terakhir</h3>
          {riwayat.slice(0, 3).map((item, i) => (
            <div className="tes-item" key={i}>
              <strong>{item.waktu}</strong>
              <p>{item.isi}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}