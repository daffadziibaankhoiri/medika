'use client'

import { useMemo, useState } from 'react'
import {
  AlertTriangle, ArrowRightLeft, CheckCircle2, Save, Search,
} from 'lucide-react'
import { Button, DataTable, Status } from '@/components/ui'
import { categories, obatList, statusObat, toneStatus, totalStok, type Obat } from '@/lib/data'
import { obatDenganStokRetur } from '@/lib/returns'
import { useReturns } from '@/lib/use-returns'
import { AREA, type BarisOpname } from './types'

export function PanelOpname() {
  const { daftar: retur } = useReturns()
  const [area, setArea] = useState(AREA[0])
  const [kategori, setKategori] = useState('all')
  const [query, setQuery] = useState('')
  const [baris, setBaris] = useState<BarisOpname[]>(() =>
    obatList.map((obat) => ({ obat, fisik: '' })),
  )
  const [dialog, setDialog] = useState(false)
  const [alasan, setAlasan] = useState('')
  const [alasanError, setAlasanError] = useState('')
  const [pesan, setPesan] = useState<{ tone: 'error' | 'success'; teks: string } | null>(null)
  const [terkirim, setTerkirim] = useState<{ alasan: string; waktu: string } | null>(null)

  // Stok fisik awal dibuat sedikit berbeda dari sistem supaya ada selisih.
  const [fisikAwal] = useState<Record<string, number>>(() => ({
    'obt-001': 22,
    'obt-003': 19,
    'obt-007': 41,
  }))

  const barisEfektif = useMemo(() => {
    const obatEfektif = new Map(
      obatDenganStokRetur(obatList, retur).map((obat) => [obat.id, obat]),
    )
    return baris.map((row) => ({
      ...row,
      obat: obatEfektif.get(row.obat.id) ?? row.obat,
    }))
  }, [baris, retur])

  const daftar = useMemo(() => {
    const q = query.trim().toLowerCase()
    return barisEfektif.filter(({ obat }) => {
      const cocokTeks =
        q === '' || obat.nama.toLowerCase().includes(q) || obat.sku.toLowerCase().includes(q)
      const cocokKategori = kategori === 'all' || obat.kategori === kategori
      return cocokTeks && cocokKategori
    })
  }, [barisEfektif, query, kategori])

  const sistem = (obat: Obat) => totalStok(obat.batches)
  const fisik = (row: BarisOpname) => {
    if (row.fisik !== '') return Number(row.fisik)
    const seed = fisikAwal[row.obat.id]
    return seed === undefined ? sistem(row.obat) : seed
  }
  const selisih = (row: BarisOpname) => fisik(row) - sistem(row.obat)

  const berubah = baris.filter((row) => selisih(row) !== 0).length

  function setFisik(id: string, nilai: string) {
    setBaris((current) =>
      current.map((row) => (row.obat.id === id ? { ...row, fisik: nilai } : row)),
    )
  }

  function bukaDialog() {
    setAlasan('')
    setAlasanError('')
    setDialog(true)
  }

  function konfirmasiSimpan() {
    if (!alasan.trim()) {
      setAlasanError('Alasan wajib diisi sebelum adjustment disimpan.')
      return
    }

    const rincian = baris
      .filter((row) => selisih(row) !== 0)
      .map((row) => `${row.obat.nama} (${sistem(row.obat)} → ${fisik(row)})`)

    setTerkirim({
      alasan: alasan.trim(),
      waktu: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
    })
    setDialog(false)
    setBaris((current) => current.map((row) => ({ ...row, fisik: '' })))
    setPesan({
      tone: 'success',
      teks: `Adjustment stok tersimpan untuk ${rincian.length} obat. Alasan: ${alasan.trim()}.`,
    })
  }

  return (
    <div id="panel-opname" role="tabpanel" aria-labelledby="tab-opname">
      <div role="status" aria-live="polite">
        {pesan && (
          <div className={`auth-message ${pesan.tone}`} style={{ margin: '0 0 16px' }}>
            <CheckCircle2 aria-hidden="true" />
            <span>{pesan.teks}</span>
          </div>
        )}
      </div>

      {terkirim && (
        <div className="riwayat-adjustment">
          <ArrowRightLeft aria-hidden="true" />
          <div>
            <strong>Adjustment terakhir</strong>
            <p>{terkirim.waktu} — “{terkirim.alasan}”</p>
          </div>
        </div>
      )}

      <section className="panel">
        <div className="obat-toolbar">
          <div className="field-inline">
            <label htmlFor="opname-area">Area</label>
            <select
              id="opname-area"
              value={area}
              onChange={(event) => setArea(event.target.value)}
            >
              {AREA.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>

          <div className="field-inline">
            <label htmlFor="opname-kategori">Kategori</label>
            <select
              id="opname-kategori"
              value={kategori}
              onChange={(event) => setKategori(event.target.value)}
            >
              <option value="all">Semua kategori</option>
              {categories.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>

          <div className="search-box">
            <Search aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari nama obat atau SKU..."
              aria-label="Cari nama obat atau SKU"
            />
          </div>
        </div>

        <p className="opname-info">
          Area: <strong>{area}</strong> · {daftar.length} obat diperiksa ·{' '}
          <strong className={berubah > 0 ? 'selisih-ada' : 'selisih-nihil'}>
            {berubah} barang perlu adjustment
          </strong>
        </p>

        <DataTable>
          <thead>
            <tr>
              <th scope="col">Nama Obat</th>
              <th scope="col">SKU</th>
              <th scope="col">Kategori</th>
              <th scope="col">Stok Sistem</th>
              <th scope="col">Stok Fisik</th>
              <th scope="col">Selisih</th>
              <th scope="col">Status FEFO</th>
            </tr>
          </thead>
          <tbody>
            {daftar.length === 0 ? (
              <tr>
                <td className="obat-kosong" colSpan={7}>
                  Tidak ada obat yang cocok dengan filter ini. Ubah kata kunci atau
                  pilih kategori lain.
                </td>
              </tr>
            ) : daftar.map((row) => {
              const sel = selisih(row)
              return (
                <tr key={row.obat.id}>
                  <td><strong>{row.obat.nama}</strong></td>
                  <td><span className="sku">{row.obat.sku}</span></td>
                  <td>{row.obat.kategori}</td>
                  <td><strong>{sistem(row.obat)}</strong></td>
                  <td>
                    <input
                      className="opname-input"
                      type="number"
                      min="0"
                      value={row.fisik === '' ? String(fisik(row)) : row.fisik}
                      onChange={(event) => setFisik(row.obat.id, event.target.value)}
                      aria-label={`Stok fisik ${row.obat.nama}`}
                    />
                  </td>
                  <td>
                    <span
                      className={`selisih ${sel > 0 ? 'selisih-naik' : sel < 0 ? 'selisih-turun' : 'selisih-nihil'}`}
                    >
                      {sel > 0 ? `+${sel}` : sel}
                    </span>
                  </td>
                  <td><Status tone={toneStatus(statusObat(row.obat.batches))}>{statusObat(row.obat.batches)}</Status></td>
                </tr>
              )
            })}
          </tbody>
        </DataTable>

        <div className="settings-actions">
          <Button onClick={bukaDialog} disabled={berubah === 0}>
            <Save aria-hidden="true" /> Simpan Adjustment
          </Button>
        </div>
      </section>

      {dialog && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && setDialog(false)}>
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="konfirmasi-judul">
            <div className="modal-header">
              <div>
                <h2 id="konfirmasi-judul">Konfirmasi Simpan Adjustment</h2>
                <p>{berubah} barang akan disesuaikan dengan stok fisik.</p>
              </div>
              <button className="modal-close" onClick={() => setDialog(false)} aria-label="Tutup dialog">×</button>
            </div>

            <div className="modal-form">
              <ul className="konfirmasi-rincian">
                {baris.filter((row) => selisih(row) !== 0).map((row) => (
                  <li key={row.obat.id}>
                    <span>{row.obat.nama}</span>
                    <strong>
                      {sistem(row.obat)} → {fisik(row)}
                      <span className={`selisih ${selisih(row) > 0 ? 'selisih-naik' : 'selisih-turun'}`}>
                        {selisih(row) > 0 ? `+${selisih(row)}` : selisih(row)}
                      </span>
                    </strong>
                  </li>
                ))}
                {berubah === 0 && <li className="konfirmasi-kosong">Tidak ada selisih untuk disimpan.</li>}
              </ul>

              <div className="field">
                <label htmlFor="alasan-adjustment">
                  Alasan adjustment <span className="wajib">* wajib</span>
                </label>
                <textarea
                  id="alasan-adjustment"
                  className="opname-textarea"
                  value={alasan}
                  onChange={(e) => setAlasan(e.target.value)}
                  placeholder="Contoh: Kerusakan kemasan, Kadaluwarsa tidak terpisahkan, salah input pembelian…"
                  aria-invalid={alasanError ? true : undefined}
                  aria-describedby={alasanError ? 'alasan-error' : undefined}
                />
              </div>

              <div aria-live="assertive" aria-atomic="true">
                {alasanError && (
                  <p className="auth-message error" id="alasan-error">
                    <AlertTriangle aria-hidden="true" /> <span>{alasanError}</span>
                  </p>
                )}
              </div>

              <div className="modal-actions">
                <Button secondary onClick={() => setDialog(false)}>Batal</Button>
                <button className="primary-button" type="button" onClick={konfirmasiSimpan}>
                  Ya, Simpan Adjustment
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}