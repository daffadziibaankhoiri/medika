'use client'

import { Fragment, useMemo, useState } from 'react'
import {
  ChevronDown, ChevronRight, PackagePlus, Search, SlidersHorizontal,
} from 'lucide-react'
import { Button, DataTable, Field, Modal, Status } from '@/components/ui'
import { PageIntro } from '@/components/page-intro'
import {
  batchTerdekat, categories, costPriceOf, formatTanggal, isTanggalValid, money, obatList,
  sisaHari, statusBatch, statusObat, suppliers, toneStatus, totalStok, urutBatchFEFO,
  type Obat,
} from '@/lib/data'
import { useCanViewCostPrice } from '@/lib/use-session'

const PAGE_SIZE = 5

type FilterStatus = 'all' | 'Aman' | 'Segera' | 'Kadaluwarsa'

type FormBarang = {
  obatId: string
  supplier: string
  lot: string
  kedaluwarsa: string
  jumlah: string
}

const FORM_KOSONG: FormBarang = {
  obatId: '',
  supplier: '',
  lot: '',
  kedaluwarsa: '',
  jumlah: '',
}

export default function ObatPage() {
  const showCostPrice = useCanViewCostPrice()

  const [rows, setRows] = useState<Obat[]>(obatList)
  const [expanded, setExpanded] = useState<string | null>(null)

  const [query, setQuery] = useState('')
  const [kategori, setKategori] = useState('all')
  const [status, setStatus] = useState<FilterStatus>('all')
  const [page, setPage] = useState(1)

  const [formTerbuka, setFormTerbuka] = useState(false)
  const [form, setForm] = useState<FormBarang>(FORM_KOSONG)
  const [pesan, setPesan] = useState<{ tone: 'error' | 'success'; teks: string } | null>(null)

  const terfilter = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter((obat) => {
      const cocokCari =
        q === '' ||
        obat.nama.toLowerCase().includes(q) ||
        obat.sku.toLowerCase().includes(q) ||
        obat.kategori.toLowerCase().includes(q)
      const cocokKategori = kategori === 'all' || obat.kategori === kategori
      const cocokStatus = status === 'all' || statusObat(obat.batches) === status
      return cocokCari && cocokKategori && cocokStatus
    })
  }, [rows, query, kategori, status])

  const totalHalaman = Math.max(1, Math.ceil(terfilter.length / PAGE_SIZE))
  const halamanAman = Math.min(page, totalHalaman)
  const tampil = terfilter.slice((halamanAman - 1) * PAGE_SIZE, halamanAman * PAGE_SIZE)

  const setFilter = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value)
    setPage(1)
  }

  const toggleBaris = (id: string) => setExpanded((current) => (current === id ? null : id))

  function bukaFormTerima() {
    setForm(FORM_KOSONG)
    setPesan(null)
    setFormTerbuka(true)
  }

  function simpanBarangMasuk(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!form.obatId) return setPesan({ tone: 'error', teks: 'Pilih obat terlebih dahulu.' })
    if (!form.supplier) return setPesan({ tone: 'error', teks: 'Pilih supplier terlebih dahulu.' })
    if (!form.lot.trim()) return setPesan({ tone: 'error', teks: 'Nomor batch wajib diisi.' })
    if (!form.kedaluwarsa) return setPesan({ tone: 'error', teks: 'Tanggal kedaluwarsa wajib diisi.' })
    // Penjaga tambahan: pastikan tanggal benar-benar bisa diurai dan masuk akal.
    if (!isTanggalValid(form.kedaluwarsa)) {
      return setPesan({ tone: 'error', teks: 'Tanggal kedaluwarsa tidak valid.' })
    }

    const jumlah = Number(form.jumlah)
    if (!Number.isFinite(jumlah) || jumlah <= 0) {
      return setPesan({ tone: 'error', teks: 'Jumlah harus berupa angka lebih dari 0.' })
    }

    const namaObat = rows.find((obat) => obat.id === form.obatId)?.nama ?? ''
    const namaSupplier = suppliers.find((item) => item.name === form.supplier)?.name ?? form.supplier

    setRows((current) =>
      current.map((obat) =>
        obat.id === form.obatId
          ? {
              ...obat,
              batches: [
                ...obat.batches,
                { lot: form.lot.trim(), masuk: '2026-09-14', kedaluwarsa: form.kedaluwarsa, stok: jumlah },
              ],
            }
          : obat,
      ),
    )

    setFormTerbuka(false)
    setPesan({
      tone: 'success',
      teks: `Batch ${form.lot.trim()} untuk ${namaObat} dari ${namaSupplier} sebanyak ${jumlah} unit berhasil diterima.`,
    })
  }

  const adaPesan = pesan !== null

  return (
    <>
      <PageIntro
        title="Manajemen Obat"
        subtitle="Pantau stok per batch, tanggal kedaluwarsa, dan status FEFO setiap obat."
        action={<Button onClick={bukaFormTerima}><PackagePlus /> Terima Barang Masuk</Button>}
      />

      <div aria-live="polite" aria-atomic="true">
        {adaPesan && (
          <p className={`auth-message ${pesan.tone}`} style={{ margin: '0 0 16px' }}>
            {pesan.teks}
          </p>
        )}
      </div>

      <section className="panel">
        {/* Satu set filter, tepat di atas tabel, di dalam card yang sama. */}
        <div className="obat-toolbar">
          <div className="search-box">
            <Search aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setFilter(setQuery)(event.target.value)}
              placeholder="Cari nama obat atau SKU..."
              aria-label="Cari nama obat atau SKU"
            />
          </div>

          <select
            value={kategori}
            onChange={(event) => setFilter(setKategori)(event.target.value)}
            aria-label="Filter kategori obat"
          >
            <option value="all">Semua kategori</option>
            {categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>

          <select
            value={status}
            onChange={(event) => setFilter(setStatus)(event.target.value as FilterStatus)}
            aria-label="Filter status FEFO"
          >
            <option value="all">Semua status</option>
            <option value="Aman">Aman</option>
            <option value="Segera">Segera Kadaluwarsa</option>
            <option value="Kadaluwarsa">Kadaluwarsa</option>
          </select>

          <button
            type="button"
            className="filter-button"
            onClick={() => { setQuery(''); setKategori('all'); setStatus('all'); setPage(1) }}
          >
            <SlidersHorizontal aria-hidden="true" /> Reset
          </button>
        </div>

        <DataTable>
          <thead>
            <tr>
              <th scope="col" style={{ width: 34 }}><span className="sr-only">Buka batch</span></th>
              <th scope="col">Nama Obat</th>
              <th scope="col">SKU</th>
              <th scope="col">Kategori</th>
              <th scope="col">Total Stok</th>
              <th scope="col">Batch Terdekat</th>
              <th scope="col">Status FEFO</th>
              {showCostPrice && <th scope="col">Harga Pokok</th>}
            </tr>
          </thead>
          <tbody>
            {tampil.map((obat) => {
              const terdekat = batchTerdekat(obat.batches)
              const statusFefo = statusObat(obat.batches)
              const terbuka = expanded === obat.id
              return (
                <Fragment key={obat.id}>
                  <tr className={terbuka ? 'obat-row terbuka' : 'obat-row'}>
                  <td>
                    <button
                      type="button"
                      className="expand-button"
                      onClick={() => toggleBaris(obat.id)}
                      aria-expanded={terbuka}
                      aria-label={`${terbuka ? 'Sembunyikan' : 'Tampilkan'} batch ${obat.nama}`}
                    >
                      {terbuka ? <ChevronDown aria-hidden="true" /> : <ChevronRight aria-hidden="true" />}
                    </button>
                  </td>
                  <td><strong>{obat.nama}</strong></td>
                  <td><span className="sku">{obat.sku}</span></td>
                  <td>{obat.kategori}</td>
                  <td><strong>{totalStok(obat.batches)}</strong> unit</td>
                  <td>
                    {terdekat ? (
                      <>
                        <strong>{formatTanggal(terdekat.kedaluwarsa)}</strong>
                        <span className="sku">{terdekat.lot}</span>
                      </>
                    ) : <span className="sku">tidak ada batch</span>}
                  </td>
                  <td><Status tone={toneStatus(statusFefo)}>{statusFefo}</Status></td>
                  {showCostPrice && <td>{money(costPriceOf(obat.nama))}</td>}
                  </tr>

                  {/* Detail batch tampil tepat di bawah baris obatnya. */}
                  {terbuka && (
                    <tr className="batch-row">
                      <td colSpan={showCostPrice ? 8 : 7}>
                        <div className="batch-detail">
                          <p className="batch-detail-judul">
                            Detail batch — <strong>{obat.nama}</strong> ({obat.sku}) · {obat.batches.length} batch
                          </p>
                          <table>
                            <thead>
                              <tr>
                                <th scope="col">No. Batch / Lot</th>
                                <th scope="col">Tanggal Masuk</th>
                                <th scope="col">Tanggal Kedaluwarsa</th>
                                <th scope="col">Stok Batch</th>
                                <th scope="col">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {urutBatchFEFO(obat.batches).map((batch) => {
                                const statusBatchIni = statusBatch(batch.kedaluwarsa)
                                const sisa = sisaHari(batch.kedaluwarsa)
                                return (
                                  <tr key={batch.lot}>
                                    <td><strong>{batch.lot}</strong></td>
                                    <td>{formatTanggal(batch.masuk)}</td>
                                    <td>
                                      {formatTanggal(batch.kedaluwarsa)}
                                      <span className="sku">
                                        {sisa < 0 ? `lewat ${Math.abs(sisa)} hari` : `${sisa} hari lagi`}
                                      </span>
                                    </td>
                                    <td><strong>{batch.stok}</strong> unit</td>
                                    <td><Status tone={toneStatus(statusBatchIni)}>{statusBatchIni}</Status></td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}

            {tampil.length === 0 && (
              <tr>
                <td colSpan={showCostPrice ? 8 : 7} className="obat-kosong">
                  Tidak ada obat yang cocok dengan filter.
                </td>
              </tr>
            )}
          </tbody>
        </DataTable>

        {/* Satu pagination, tepat di bawah tabel, di dalam card yang sama. */}
        <div className="obat-pagination" aria-label="Pagination daftar obat">
          <span>
            Menampilkan {terfilter.length === 0 ? 0 : (halamanAman - 1) * PAGE_SIZE + 1}
            {' '}sampai {Math.min(halamanAman * PAGE_SIZE, terfilter.length)} dari {terfilter.length} obat
          </span>
          <div className="pagination-controls">
            <button
              className="pagination-button"
              disabled={halamanAman === 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              aria-label="Halaman sebelumnya"
            >‹</button>
            {Array.from({ length: totalHalaman }, (_, index) => index + 1).map((nomor) => (
              <button
                key={nomor}
                className={`pagination-button ${halamanAman === nomor ? 'active' : ''}`}
                onClick={() => setPage(nomor)}
                aria-label={`Halaman ${nomor}`}
                aria-current={halamanAman === nomor ? 'page' : undefined}
              >{nomor}</button>
            ))}
            <button
              className="pagination-button"
              disabled={halamanAman === totalHalaman}
              onClick={() => setPage((current) => Math.min(totalHalaman, current + 1))}
              aria-label="Halaman berikutnya"
            >›</button>
          </div>
        </div>
      </section>

      {formTerbuka && (
        <Modal title="Terima Barang Masuk" description="Catat batch obat baru yang diterima dari supplier." onClose={() => setFormTerbuka(false)}>
          <form className="modal-form" onSubmit={simpanBarangMasuk} noValidate>
            <Field label="Pilih obat" htmlFor="terima-obat">
              <select
                id="terima-obat"
                value={form.obatId}
                onChange={(event) => setForm({ ...form, obatId: event.target.value })}
                aria-invalid={pesan?.tone === 'error'}
              >
                <option value="">-- Pilih obat --</option>
                {rows.map((obat) => (
                  <option key={obat.id} value={obat.id}>{obat.nama} ({obat.sku})</option>
                ))}
              </select>
            </Field>

            <Field label="Pilih supplier" htmlFor="terima-supplier">
              <select
                id="terima-supplier"
                value={form.supplier}
                onChange={(event) => setForm({ ...form, supplier: event.target.value })}
              >
                <option value="">-- Pilih supplier --</option>
                {suppliers.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}
              </select>
            </Field>

            <Field label="Nomor batch / lot" htmlFor="terima-lot">
              <input
                id="terima-lot"
                value={form.lot}
                onChange={(event) => setForm({ ...form, lot: event.target.value })}
                placeholder="Contoh: LOT-2609-A"
              />
            </Field>

            <Field label="Tanggal kedaluwarsa" htmlFor="terima-kedaluwarsa">
              <input
                id="terima-kedaluwarsa"
                type="date"
                value={form.kedaluwarsa}
                onChange={(event) => setForm({ ...form, kedaluwarsa: event.target.value })}
              />
            </Field>

            <Field label="Jumlah" htmlFor="terima-jumlah">
              <input
                id="terima-jumlah"
                type="number"
                min="1"
                value={form.jumlah}
                onChange={(event) => setForm({ ...form, jumlah: event.target.value })}
                placeholder="Contoh: 24"
              />
            </Field>

            <div aria-live="assertive" aria-atomic="true">
              {pesan?.tone === 'error' && (
                <p className="auth-message error">
                  <span>{pesan.teks}</span>
                </p>
              )}
            </div>

            <div className="modal-actions">
              <Button secondary onClick={() => setFormTerbuka(false)}>Batal</Button>
              <button className="primary-button" type="submit">Simpan Barang Masuk</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}