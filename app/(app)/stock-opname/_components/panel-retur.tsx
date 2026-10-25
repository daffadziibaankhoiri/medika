'use client'

import { useMemo, useState } from 'react'
import { CheckCircle2, Search, Send, Truck } from 'lucide-react'
import { Button, DataTable, EmptyRow, Status } from '@/components/ui'
import { SupplierReturnDialog } from '@/components/returns/supplier-return-dialog'
import { formatTanggal } from '@/lib/data'
import {
  cancelRetur,
  STATUS_RETUR,
  updateStatusRetur,
  type Retur,
  type StatusRetur,
} from '@/lib/returns'
import { useReturns } from '@/lib/use-returns'

type FilterStatus = 'all' | StatusRetur

function toneStatusRetur(status: StatusRetur): 'warning' | 'info' | 'safe' {
  if (status === 'Diajukan') return 'warning'
  if (status === 'Dikirim') return 'info'
  return 'safe'
}

export function PanelRetur() {
  const { daftar, siap } = useReturns()
  const [dialogTerbuka, setDialogTerbuka] = useState(false)
  const [query, setQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [pesan, setPesan] = useState<{ tone: 'error' | 'success'; teks: string } | null>(null)

  const riwayat = useMemo(() => {
    const pencarian = query.trim().toLowerCase()
    return daftar.filter((row) => {
      const cocokTeks =
        pencarian === '' ||
        row.nomorRetur.toLowerCase().includes(pencarian) ||
        row.namaObat.toLowerCase().includes(pencarian) ||
        row.nomorBatch.toLowerCase().includes(pencarian) ||
        row.supplier.toLowerCase().includes(pencarian) ||
        row.namaPengaju.toLowerCase().includes(pencarian)
      const cocokStatus = filterStatus === 'all' || row.status === filterStatus
      return cocokTeks && cocokStatus
    })
  }, [daftar, filterStatus, query])

  function kirim(row: Retur) {
    const hasil = updateStatusRetur(row.id, 'Dikirim')
    if (!hasil) {
      setPesan({ tone: 'error', teks: `Status ${row.nomorRetur} tidak dapat diubah menjadi Dikirim.` })
      return
    }
    setPesan({ tone: 'success', teks: `${row.nomorRetur} ditandai Dikirim. Stok batch dikurangi ${row.jumlah} unit.` })
  }

  function selesaikan(row: Retur) {
    const hasil = updateStatusRetur(row.id, 'Selesai')
    if (!hasil) {
      setPesan({ tone: 'error', teks: `Status ${row.nomorRetur} tidak dapat diubah menjadi Selesai.` })
      return
    }
    setPesan({ tone: 'success', teks: `${row.nomorRetur} ditandai Selesai.` })
  }

  function batalkan(row: Retur) {
    const berhasil = cancelRetur(row.id)
    if (!berhasil) {
      setPesan({ tone: 'error', teks: `Pengajuan ${row.nomorRetur} tidak dapat dibatalkan.` })
      return
    }
    setPesan({ tone: 'success', teks: `Pengajuan ${row.nomorRetur} berhasil dibatalkan.` })
  }

  return (
    <div id="panel-retur" role="tabpanel" aria-labelledby="tab-retur">
      <div role="status" aria-live="polite">
        {pesan && (
          <p className={`auth-message ${pesan.tone}`} style={{ margin: '0 0 16px' }}>
            <CheckCircle2 aria-hidden="true" /> <span>{pesan.teks}</span>
          </p>
        )}
      </div>

      <section className="panel">
        <div className="panel-header retur-panel-header">
          <div>
            <h2>Retur ke Supplier</h2>
            <p>Ajukan pengembalian obat ke supplier dan pantau perubahan statusnya.</p>
          </div>
          <Button onClick={() => setDialogTerbuka(true)}>
            <Send aria-hidden="true" /> Ajukan Retur
          </Button>
        </div>
      </section>

      <section className="panel restock-panel retur-riwayat-panel">
        <div className="panel-header">
          <div>
            <h2>Riwayat Retur</h2>
            <p>Data tersimpan di localStorage pada kunci <code>healti_retur</code>.</p>
          </div>
        </div>

        <div className="obat-toolbar retur-toolbar">
          <div className="search-box">
            <Search aria-hidden="true" />
            <label className="sr-only" htmlFor="cari-retur">Cari riwayat retur</label>
            <input
              id="cari-retur"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari nomor retur, obat, batch, supplier..."
            />
          </div>
          <div className="field-inline">
            <label htmlFor="filter-status-retur">Status retur</label>
            <select
              id="filter-status-retur"
              value={filterStatus}
              onChange={(event) => setFilterStatus(event.target.value as FilterStatus)}
            >
              <option value="all">Semua status</option>
              {STATUS_RETUR.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </div>
          <span className="toolbar-count">{siap ? `${riwayat.length} retur ditemukan` : 'Memuat data retur...'}</span>
        </div>

        <DataTable label="Riwayat retur ke supplier">
          <table className="retur-history-table">
            <thead>
              <tr>
                <th scope="col">No. Retur</th>
                <th scope="col">Nama Obat</th>
                <th scope="col">Nomor Batch</th>
                <th scope="col">Supplier</th>
                <th scope="col">Jumlah</th>
                <th scope="col">Alasan</th>
                <th scope="col">Status</th>
                <th scope="col">Tanggal</th>
                <th scope="col">Pengaju</th>
                <th scope="col">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {riwayat.length === 0 ? (
                <EmptyRow colSpan={10}>
                  Belum ada retur yang cocok dengan pencarian atau filter status.
                </EmptyRow>
              ) : riwayat.map((row) => (
                <tr key={row.id}>
                  <td><strong>{row.nomorRetur}</strong></td>
                  <td>{row.namaObat}</td>
                  <td>
                    <span className="sku">{row.nomorBatch}</span>
                    <span className="retur-id-batch">{row.idBatch}</span>
                  </td>
                  <td>{row.supplier}</td>
                  <td>{row.jumlah} unit</td>
                  <td className="retur-alasan-cell">
                    <strong>{row.alasan}</strong>
                    <span>{row.catatan}</span>
                  </td>
                  <td><Status tone={toneStatusRetur(row.status)}>{row.status}</Status></td>
                  <td>{formatTanggal(row.tanggal)}</td>
                  <td>{row.namaPengaju}</td>
                  <td>
                    <div className="row-actions">
                      {row.status === 'Diajukan' && (
                        <>
                          <button
                            className="action-link"
                            type="button"
                            onClick={() => kirim(row)}
                            aria-label={`Kirim retur ${row.nomorRetur} ke supplier`}
                          >
                            <Truck aria-hidden="true" /> Dikirim
                          </button>
                          <button
                            className="action-link danger"
                            type="button"
                            onClick={() => batalkan(row)}
                            aria-label={`Batalkan pengajuan retur ${row.nomorRetur}`}
                          >
                            Batalkan
                          </button>
                        </>
                      )}
                      {row.status === 'Dikirim' && (
                        <button
                          className="action-link"
                          type="button"
                          onClick={() => selesaikan(row)}
                          aria-label={`Tandai retur ${row.nomorRetur} selesai`}
                        >
                          <CheckCircle2 aria-hidden="true" /> Selesai
                        </button>
                      )}
                      {row.status === 'Selesai' && <span className="cell-note">Tidak ada aksi</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataTable>
      </section>

      {dialogTerbuka && (
        <SupplierReturnDialog
          onClose={() => setDialogTerbuka(false)}
          onSubmitted={(retur) => setPesan({ tone: 'success', teks: `Pengajuan ${retur.nomorRetur} berhasil dibuat.` })}
        />
      )}
    </div>
  )
}
