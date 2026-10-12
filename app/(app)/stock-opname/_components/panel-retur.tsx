'use client'

import { useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, Send } from 'lucide-react'
import { DataTable, Status } from '@/components/ui'
import {
  formatTanggal, obatList, sisaHari, statusBatch,
} from '@/lib/data'
import { RETUR_AWAL, type Retur } from './types'

export function PanelRetur() {
  const [daftar, setDaftar] = useState<Retur[]>(RETUR_AWAL)
  const [form, setForm] = useState({ obat: '', supplier: '', lot: '', jumlah: '', alasan: '' })
  const [error, setError] = useState('')
  const [sukses, setSukses] = useState('')

  // Kandidat retur: hanya batch yang benar-benar sudah kedaluwarsa.
  const kandidat = useMemo(
    () => obatList.flatMap((obat) =>
      obat.batches
        .filter((b) => statusBatch(b.kedaluwarsa) === 'Kadaluwarsa' && b.stok > 0)
        .map((b) => ({ obat, batch: b })),
    ),
    [],
  )

  const dipilih = kandidat.find(
    (item) => item.obat.id === form.obat && item.batch.lot === form.lot,
  )

  function ajukanRetur(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSukses('')
    if (!dipilih) return setError('Pilih obat dan batch kedaluwarsa terlebih dahulu.')
    if (!form.supplier.trim()) return setError('Supplier wajib diisi.')
    if (!form.jumlah || Number(form.jumlah) <= 0) return setError('Jumlah retur harus lebih dari 0.')
    if (!form.alasan.trim()) return setError('Alasan retur wajib diisi.')

    const baru: Retur = {
      id: `RT-2026-${String(daftar.length + 32).padStart(4, '0')}`,
      obat: dipilih.obat.nama,
      supplier: form.supplier.trim(),
      lot: dipilih.batch.lot,
      kedaluwarsa: dipilih.batch.kedaluwarsa,
      jumlah: Number(form.jumlah),
      alasan: form.alasan.trim(),
      tanggal: '2026-09-14',
    }

    setDaftar((current) => [baru, ...current])
    setForm({ obat: '', supplier: '', lot: '', jumlah: '', alasan: '' })
    setError('')
    setSukses(`Pengajuan retur ${baru.id} untuk ${baru.obat} (${baru.lot}) berhasil dibuat.`)
  }

  return (
    <div id="panel-retur" role="tabpanel" aria-labelledby="tab-retur">
      <div role="status" aria-live="polite">
        {error && (
          <p className="auth-message error" style={{ margin: '0 0 16px' }}>
            <AlertTriangle aria-hidden="true" /> <span>{error}</span>
          </p>
        )}
        {sukses && (
          <p className="auth-message success" style={{ margin: '0 0 16px' }}>
            <CheckCircle2 aria-hidden="true" /> <span>{sukses}</span>
          </p>
        )}
      </div>

      <section className="panel">
        <h2>Ajukan Retur Obat Kedaluwarsa</h2>
        <p className="panel-note">Hanya batch yang sudah lewat tanggal kedaluwarsa yang dapat diretur.</p>

        <form className="modal-form retur-form" onSubmit={ajukanRetur} noValidate>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="retur-obat">Obat</label>
              <select
                id="retur-obat"
                value={form.obat}
                onChange={(e) => setForm({ ...form, obat: e.target.value, lot: '' })}
              >
                <option value="">-- Pilih obat --</option>
                {[...new Set(kandidat.map((k) => k.obat.id))].map((id) => {
                  const obat = kandidat.find((k) => k.obat.id === id)!.obat
                  return <option key={id} value={id}>{obat.nama}</option>
                })}
              </select>
            </div>

            <div className="field">
              <label htmlFor="retur-batch">Batch kedaluwarsa</label>
              <select
                id="retur-batch"
                value={form.lot}
                onChange={(e) => setForm({ ...form, lot: e.target.value })}
                disabled={!form.obat}
              >
                <option value="">-- Pilih batch --</option>
                {kandidat
                  .filter((k) => k.obat.id === form.obat)
                  .map((k) => (
                    <option key={k.batch.lot} value={k.batch.lot}>
                      {k.batch.lot} — kedaluwarsa {formatTanggal(k.batch.kedaluwarsa)}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="form-grid">
            <div className="field">
              <label htmlFor="retur-supplier">Supplier</label>
              <input
                id="retur-supplier"
                value={form.supplier}
                onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                placeholder="Nama supplier"
              />
            </div>
            <div className="field">
              <label htmlFor="retur-jumlah">Jumlah diretur</label>
              <input
                id="retur-jumlah"
                type="number"
                min="1"
                value={form.jumlah}
                onChange={(e) => setForm({ ...form, jumlah: e.target.value })}
                placeholder="Contoh: 14"
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="retur-alasan">Alasan retur</label>
            <textarea
              id="retur-alasan"
              className="opname-textarea"
              value={form.alasan}
              onChange={(e) => setForm({ ...form, alasan: e.target.value })}
              placeholder="Contoh: Batch kedaluwarsa sebelum sempat terjual."
            />
          </div>

          {dipilih && (
            <div className="retur-info">
              <AlertTriangle aria-hidden="true" />
              <span>
                Batch <strong>{dipilih.batch.lot}</strong> kedaluwarsa{' '}
                {formatTanggal(dipilih.batch.kedaluwarsa)} ({sisaHari(dipilih.batch.kedaluwarsa)} hari lalu)
                · stok tersisa {dipilih.batch.stok} unit
              </span>
            </div>
          )}

          <div className="modal-actions">
            <button className="primary-button" type="submit">
              <Send aria-hidden="true" /> Ajukan Retur
            </button>
          </div>
        </form>
      </section>

      <section className="panel restock-panel">
        <div className="panel-header">
          <div>
            <h2>Daftar Pengajuan Retur</h2>
            <p>Riwayat retur obat kedaluwarsa ke supplier</p>
          </div>
        </div>
        <DataTable>
          <thead>
            <tr>
              <th scope="col">No. Retur</th>
              <th scope="col">Obat</th>
              <th scope="col">Batch</th>
              <th scope="col">Kedaluwarsa</th>
              <th scope="col">Supplier</th>
              <th scope="col">Jumlah</th>
              <th scope="col">Alasan</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {daftar.length === 0 ? (
              <tr>
                <td className="obat-kosong" colSpan={8}>
                  Belum ada pengajuan retur. Gunakan formulir di atas untuk membuat yang pertama.
                </td>
              </tr>
            ) : daftar.map((row) => (
              <tr key={row.id}>
                <td><strong>{row.id}</strong></td>
                <td>{row.obat}</td>
                <td><span className="sku">{row.lot}</span></td>
                <td>{formatTanggal(row.kedaluwarsa)}</td>
                <td>{row.supplier}</td>
                <td>{row.jumlah} unit</td>
                <td className="retur-alasan-cell">{row.alasan}</td>
                <td><Status tone={row.tanggal === '2026-09-14' ? 'warning' : 'safe'}>
                  {row.tanggal === '2026-09-14' ? 'Diajukan' : 'Disetujui'}
                </Status></td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </section>
    </div>
  )
}