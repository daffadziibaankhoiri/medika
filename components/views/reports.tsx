'use client'

import { useMemo, useState } from 'react'
import { ArrowDownRight, ArrowUpRight, Download, Filter, X } from 'lucide-react'
import { Button, DataTable, EmptyRow, Field, Modal, Status } from '@/components/ui'
import { PageIntro } from '@/components/page-intro'

type Baris = {
  /** Kunci 'YYYY-MM', dipakai untuk membandingkan dengan filter. */
  key: string
  periode: string
  transaksi: number
  item: number
  pendapatan: number
  pertumbuhan: number
}

const DATA: Baris[] = [
  { key: '2026-05', periode: 'Mei 2026', transaksi: 486, item: 1284, pendapatan: 48_620_000, pertumbuhan: 12.8 },
  { key: '2026-04', periode: 'April 2026', transaksi: 428, item: 1106, pendapatan: 43_120_000, pertumbuhan: 8.4 },
  { key: '2026-03', periode: 'Maret 2026', transaksi: 395, item: 978, pendapatan: 39_780_000, pertumbuhan: 5.2 },
  { key: '2026-02', periode: 'Februari 2026', transaksi: 374, item: 942, pendapatan: 37_810_000, pertumbuhan: -2.1 },
  { key: '2026-01', periode: 'Januari 2026', transaksi: 361, item: 902, pendapatan: 36_540_000, pertumbuhan: -4.6 },
  { key: '2025-12', periode: 'Desember 2025', transaksi: 349, item: 878, pendapatan: 35_280_000, pertumbuhan: 1.7 },
]

const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

/** Opsi bulan, dari yang terbaru: ['2026-05', 'Mei 2026']. */
const OPTIONS = [
  ...BULAN.map((nama, i) => `2026-${String(i + 1).padStart(2, '0')}:${nama} 2026`),
  ...BULAN.map((nama, i) => `2025-${String(i + 1).padStart(2, '0')}:${nama} 2025`),
]

const AWAL = { dari: '2025-12', sampai: '2026-05' }

const rupiah = (value: number) => `Rp ${value.toLocaleString('id-ID')}`
const persen = (value: number) => `${value >= 0 ? '+' : ''}${value.toLocaleString('id-ID', { maximumFractionDigits: 1 })}%`
const labelBulan = (value: string) => OPTIONS.find((item) => item.startsWith(value))?.split(':')[1] ?? value

export function Reports() {
  const [open, setOpen] = useState(false)
  /** Yang sedang dipilih di form. */
  const [rentang, setRentang] = useState(AWAL)
  /** Yang sedang benar-benar dipakai tabel. */
  const [filter, setFilter] = useState(AWAL)

  const daftar = useMemo(() => {
    const urut = filter.dari <= filter.sampai
      ? filter
      : { dari: filter.sampai, sampai: filter.dari }
    return DATA.filter((row) => row.key >= urut.dari && row.key <= urut.sampai)
  }, [filter])

  const total = daftar.reduce((sum, row) => sum + row.pendapatan, 0)
  const totalTransaksi = daftar.reduce((sum, row) => sum + row.transaksi, 0)
  const totalItem = daftar.reduce((sum, row) => sum + row.item, 0)
  const berubah = rentang.dari !== filter.dari || rentang.sampai !== filter.sampai

  return (
    <>
      <PageIntro
        title="Laporan Penjualan"
        subtitle="Analisis performa penjualan berdasarkan rentang tanggal."
        action={<Button secondary onClick={() => setOpen(true)}><Download aria-hidden="true" /> Export Laporan</Button>}
      />

      <section className="panel report-filters">
        <Field label="Dari bulan" htmlFor="laporan-dari">
          <select
            id="laporan-dari"
            value={rentang.dari}
            onChange={(event) => setRentang({ ...rentang, dari: event.target.value })}
          >
            {OPTIONS.map((item) => (
              <option key={item} value={item.split(':')[0]}>{item.split(':')[1]}</option>
            ))}
          </select>
        </Field>

        <Field label="Sampai bulan" htmlFor="laporan-sampai">
          <select
            id="laporan-sampai"
            value={rentang.sampai}
            onChange={(event) => setRentang({ ...rentang, sampai: event.target.value })}
          >
            {OPTIONS.map((item) => (
              <option key={item} value={item.split(':')[0]}>{item.split(':')[1]}</option>
            ))}
          </select>
        </Field>

        <button type="button" className="primary-button" onClick={() => setFilter(rentang)} disabled={!berubah}>
          <Filter aria-hidden="true" /> Terapkan Filter
        </button>

        {berubah && (
          <button type="button" className="outline-button" onClick={() => setRentang(filter)}>
            <X aria-hidden="true" /> Batalkan
          </button>
        )}
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Penjualan Bulanan</h2>
            <p>
              {labelBulan(filter.dari)} – {labelBulan(filter.sampai)}
              {daftar.length !== DATA.length && ` · ${daftar.length} bulan`}
            </p>
          </div>
          <span className="report-total">Total: {rupiah(total)}</span>
        </div>

        <DataTable label="Laporan penjualan bulanan">
          <thead>
            <tr>
              <th scope="col">Periode</th>
              <th scope="col">Total Transaksi</th>
              <th scope="col">Item Terjual</th>
              <th scope="col">Pendapatan</th>
              <th scope="col">Pertumbuhan</th>
            </tr>
          </thead>
          <tbody>
            {daftar.length === 0 ? (
              <EmptyRow colSpan={5}>
                Tidak ada data pada rentang tersebut.{' '}
                <button type="button" className="link-button" onClick={() => setRentang(AWAL)}>
                  <X aria-hidden="true" /> Reset ke 6 bulan terakhir
                </button>
              </EmptyRow>
            ) : daftar.map((row) => {
              const naik = row.pertumbuhan >= 0
              return (
                <tr key={row.key}>
                  <td><strong>{row.periode}</strong></td>
                  <td>{row.transaksi.toLocaleString('id-ID')} transaksi</td>
                  <td>{row.item.toLocaleString('id-ID')} item</td>
                  <td><strong>{rupiah(row.pendapatan)}</strong></td>
                  <td>
                    {/* Warna sendirian tidak cukup jadi penanda arah: ikon panah
                        dan teks sr-only membedakan naik/turun tanpa warna. */}
                    <Status tone={naik ? 'safe' : 'danger'}>
                      {naik ? <ArrowUpRight aria-hidden="true" /> : <ArrowDownRight aria-hidden="true" />}
                      {persen(row.pertumbuhan)}
                      <span className="sr-only">{naik ? ', naik' : ', turun'}</span>
                    </Status>
                  </td>
                </tr>
              )
            })}

            {daftar.length > 0 && (
              <tr className="report-total-row">
                <th scope="row">Total</th>
                <td>{totalTransaksi.toLocaleString('id-ID')} transaksi</td>
                <td>{totalItem.toLocaleString('id-ID')} item</td>
                <td><strong>{rupiah(total)}</strong></td>
                <td />
              </tr>
            )}
          </tbody>
        </DataTable>
      </section>

      {open && (
        <Modal
          title="Export Laporan"
          description={`Pilih format file untuk periode ${labelBulan(filter.dari)} – ${labelBulan(filter.sampai)}.`}
          onClose={() => setOpen(false)}
        >
          <div className="modal-form">
            <Field label="Format export" htmlFor="format-export">
              <select id="format-export" defaultValue="Excel">
                <option>Excel (.xlsx)</option>
                <option>CSV (.csv)</option>
                <option>PDF (.pdf)</option>
              </select>
            </Field>
            <div className="modal-actions">
              <Button secondary onClick={() => setOpen(false)}>Batal</Button>
              <Button onClick={() => setOpen(false)}><Download aria-hidden="true" /> Export Sekarang</Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}