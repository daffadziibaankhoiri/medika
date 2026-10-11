'use client'

import { useMemo, useState } from 'react'
import {
  AlertTriangle, ArrowRightLeft, CheckCircle2, ClipboardList, PackageX, Save,
  Search, Send, Undo2,
} from 'lucide-react'
import { Button, DataTable, Status } from '@/components/ui'
import { PageIntro } from '@/components/page-intro'
import AppShell from '@/components/app-shell'
import {
  categories, formatTanggal, obatList, sisaHari, statusBatch, statusObat, toneStatus,
  totalStok, type Obat,
} from '@/lib/data'

/** Area penyimpanan yang bisa dipilih saat opname. */
const AREA = ['Semua Area', 'Gudang Utama', 'Rak Depan', 'Rak Belakang', 'Kulkas']

type BarisOpname = {
  obat: Obat
  /** Stok fisik hasil hitungan tangan. String supaya bisa dikosongkan. */
  fisik: string
}

type Tab = 'opname' | 'retur'

type Retur = {
  id: string
  obat: string
  supplier: string
  lot: string
  kedaluwarsa: string
  jumlah: number
  alasan: string
  tanggal: string
}

/** Retur yang sudah diajukan (data tiruan). */
const RETUR_AWAL: Retur[] = [
  {
    id: 'RT-2026-0031', obat: 'Tetracycline 250mg', supplier: 'PT Sehat Farma',
    lot: 'LOT-2408-X', kedaluwarsa: '2026-03-12', jumlah: 14,
    alasan: 'Seluruh batch kedaluwarsa, kemasan rusak.', tanggal: '2026-09-02',
  },
  {
    id: 'RT-2026-0028', obat: 'Amoxicillin 500mg', supplier: 'CV Medika Jaya',
    lot: 'LOT-2409-A', kedaluwarsa: '2026-08-30', jumlah: 8,
    alasan: 'Batch kedaluwarsa sebelum sempat terjual.', tanggal: '2026-08-31',
  },
]

export default function StockOpnamePage() {
  return (
    <AppShell>
      <StockOpname />
    </AppShell>
  )
}

function StockOpname() {
  const [tab, setTab] = useState<Tab>('opname')

  return (
    <>
      <PageIntro
        title="Stock Opname"
        subtitle="Cocokkan stok sistem dengan stok fisik, lalu ajukan retur obat kedaluwarsa ke supplier."
      />

      <div className="tabs" role="tablist" aria-label="Menu stock opname">
        <button
          type="button"
          role="tab"
          id="tab-opname"
          aria-selected={tab === 'opname'}
          aria-controls="panel-opname"
          className={`tab ${tab === 'opname' ? 'active' : ''}`}
          onClick={() => setTab('opname')}
        >
          <ClipboardList aria-hidden="true" /> Stock Opname
        </button>
        <button
          type="button"
          role="tab"
          id="tab-retur"
          aria-selected={tab === 'retur'}
          aria-controls="panel-retur"
          className={`tab ${tab === 'retur' ? 'active' : ''}`}
          onClick={() => setTab('retur')}
        >
          <Undo2 aria-hidden="true" /> Retur ke Supplier
        </button>
      </div>

      {tab === 'opname'
        ? <PanelOpname />
        : <PanelRetur />}
    </>
  )
}

/* ==========================================================================
   TAB 1 — STOCK OPNAME
   ========================================================================== */

function PanelOpname() {
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

  const daftar = useMemo(() => {
    const q = query.trim().toLowerCase()
    return baris.filter(({ obat }) => {
      const cocokTeks =
        q === '' || obat.nama.toLowerCase().includes(q) || obat.sku.toLowerCase().includes(q)
      const cocokKategori = kategori === 'all' || obat.kategori === kategori
      return cocokTeks && cocokKategori
    })
  }, [baris, query, kategori])

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
      {pesan && (
        <div className={`auth-message ${pesan.tone}`} style={{ margin: '0 0 16px' }}>
          <CheckCircle2 aria-hidden="true" />
          <span>{pesan.teks}</span>
        </div>
      )}

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
            {daftar.map((row) => {
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
          <Button onClick={bukaDialog} secondary={berubah === 0}>
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
                  placeholder="Contoh: Kerusakan kemasan, kadaluarsa tidak terpisahkan, salah input pembelian…"
                  aria-invalid={alasanError ? true : undefined}
                  aria-describedby={alasanError ? 'alasan-error' : undefined}
                />
              </div>

              <div aria-live="assertive" aria-atomic="true">
                {alasanError && (
                  <p className="auth-message error">
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

/* ==========================================================================
   TAB 2 — RETUR KE SUPPLIER
   ========================================================================== */

function PanelRetur() {
  const [daftar, setDaftar] = useState<Retur[]>(RETUR_AWAL)
  const [form, setForm] = useState({ obat: '', supplier: '', lot: '', jumlah: '', alasan: '' })
  const [error, setError] = useState('')
  const [sukses, setSukses] = useState('')

  // Kandidat retur: hanya batch yang benar-benar sudah kedaluwarsa.
  const kandidat = useMemo(
    () => obatList.flatMap((obat) =>
      obat.batches
        .filter((b) => statusBatch(b.kedaluwarsa) === 'Kadaluarsa' && b.stok > 0)
        .map((b) => ({ obat, batch: b })),
    ),
    [],
  )

  const dipilih = kandidat.find(
    (item) => item.obat.id === form.obat && item.batch.lot === form.lot,
  )

  function ajukanRetur(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
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
      <div aria-live="assertive" aria-atomic="true">
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

      <section className="panel retock-panel">
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
            {daftar.map((row) => (
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

