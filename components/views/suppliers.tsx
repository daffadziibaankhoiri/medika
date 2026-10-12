'use client'

import { useMemo, useState } from 'react'
import { FileText, Pencil, Plus, Search } from 'lucide-react'
import { Button, DataTable, EmptyRow, Field, Modal, Status } from '@/components/ui'
import { PageIntro } from '@/components/page-intro'
import { suppliers, type Supplier } from '@/lib/data'

/** Riwayat pembelian per supplier (data demo, sama seperti tabel utama). */
type Pembelian = {
  id: string
  supplier: string
  tanggal: string
  total: string
  status: 'Diterima' | 'Diproses'
}

const PEMBELIAN: Pembelian[] = [
  { id: '#PO-240513', supplier: 'PT Sehat Farma', tanggal: '13 Mei 2026', total: 'Rp 4.250.000', status: 'Diterima' },
  { id: '#PO-240509', supplier: 'CV Medika Jaya', tanggal: '09 Mei 2026', total: 'Rp 2.840.000', status: 'Diproses' },
  { id: '#PO-240504', supplier: 'Distributor Kimia Farma', tanggal: '04 Mei 2026', total: 'Rp 1.920.000', status: 'Diterima' },
]

export function Suppliers() {
  const [query, setQuery] = useState('')
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null)
  const [open, setOpen] = useState(false)

  const daftar = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q === '') return suppliers
    return suppliers.filter((item) =>
      [item.name, item.contact, item.address].some((v) => v.toLowerCase().includes(q)),
    )
  }, [query])

  const pesanan = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = q === ''
      ? PEMBELIAN
      : PEMBELIAN.filter((item) => item.supplier.toLowerCase().includes(q))
    return q === '' ? list.slice(0, 5) : list
  }, [query])

  return (
    <>
      <PageIntro
        title="Manajemen Supplier"
        subtitle="Kelola data pemasok dan pantau riwayat pembelian obat."
        action={<Button onClick={() => setOpen(true)}><Plus aria-hidden="true" /> Tambah Supplier</Button>}
      />

      <section className="panel">
        <div className="table-toolbar">
          <div className="search-box">
            <Search aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari nama, kontak, atau alamat supplier..."
              aria-label="Cari supplier"
            />
          </div>
          <p className="toolbar-count" role="status" aria-live="polite">
            {daftar.length} dari {suppliers.length} supplier
          </p>
        </div>

        <DataTable label="Daftar supplier">
          <thead>
            <tr>
              <th scope="col">Nama Supplier</th>
              <th scope="col">Kontak</th>
              <th scope="col">Alamat</th>
              <th scope="col">Total Restock</th>
              <th scope="col">Nilai Pembelian</th>
              <th scope="col">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {daftar.length === 0 ? (
              <EmptyRow colSpan={6}>
                Tidak ada supplier yang cocok dengan “{query}”.{' '}
                <button type="button" className="link-button" onClick={() => setQuery('')}>Hapus pencarian</button>
              </EmptyRow>
            ) : daftar.map((item) => (
              <tr key={item.name}>
                <td><strong>{item.name}</strong></td>
                <td>{item.contact}</td>
                <td>{item.address}</td>
                <td>{item.orders} transaksi</td>
                <td><strong>{item.value}</strong></td>
                <td>
                  <button type="button" className="table-action" aria-label={`Lihat detail ${item.name}`}>
                    <FileText aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="table-action"
                    onClick={() => setEditSupplier(item)}
                    aria-label={`Edit supplier ${item.name}`}
                  >
                    <Pencil aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </section>

      <section className="panel restock-panel">
        <div className="panel-header">
          <div>
            <h2>Riwayat Pembelian / Restock</h2>
            <p>Transaksi restock terbaru dari supplier</p>
          </div>
        </div>

        <DataTable label="Riwayat pembelian dari supplier">
          <thead>
            <tr>
              <th scope="col">No. Pembelian</th>
              <th scope="col">Supplier</th>
              <th scope="col">Tanggal</th>
              <th scope="col">Total</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {pesanan.length === 0 ? (
              <EmptyRow colSpan={5}>Tidak ada riwayat pembelian untuk “{query}”.</EmptyRow>
            ) : pesanan.map((row) => (
              <tr key={row.id}>
                <td><strong>{row.id}</strong></td>
                <td>{row.supplier}</td>
                <td>{row.tanggal}</td>
                <td>{row.total}</td>
                <td><Status tone={row.status === 'Diterima' ? 'safe' : 'warning'}>{row.status}</Status></td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </section>

      {editSupplier && (
        <Modal
          title="Edit Supplier"
          description="Perbarui informasi supplier yang dipilih."
          onClose={() => setEditSupplier(null)}
        >
          <div className="modal-form">
            <Field label="Nama supplier" htmlFor="edit-nama">
              <input
                id="edit-nama"
                autoFocus
                value={editSupplier.name}
                onChange={(event) => setEditSupplier({ ...editSupplier, name: event.target.value })}
              />
            </Field>
            <Field label="Kontak" htmlFor="edit-kontak">
              <input
                id="edit-kontak"
                value={editSupplier.contact}
                onChange={(event) => setEditSupplier({ ...editSupplier, contact: event.target.value })}
              />
            </Field>
            <Field label="Alamat" htmlFor="edit-alamat">
              <input
                id="edit-alamat"
                value={editSupplier.address}
                onChange={(event) => setEditSupplier({ ...editSupplier, address: event.target.value })}
              />
            </Field>
            <div className="modal-actions">
              <Button secondary onClick={() => setEditSupplier(null)}>Batal</Button>
              <Button onClick={() => setEditSupplier(null)}>Simpan Perubahan</Button>
            </div>
          </div>
        </Modal>
      )}

      {open && (
        <Modal
          title="Tambah Supplier"
          description="Simpan informasi pemasok baru."
          onClose={() => setOpen(false)}
        >
          <div className="modal-form">
            <Field label="Nama supplier" htmlFor="baru-nama">
              <input id="baru-nama" autoFocus placeholder="Contoh: PT Sehat Farma" />
            </Field>
            <Field label="Kontak" htmlFor="baru-kontak">
              <input id="baru-kontak" placeholder="Nomor telepon atau email" />
            </Field>
            <Field label="Alamat" htmlFor="baru-alamat">
              <input id="baru-alamat" placeholder="Alamat supplier" />
            </Field>
            <div className="modal-actions">
              <Button secondary onClick={() => setOpen(false)}>Batal</Button>
              <Button onClick={() => setOpen(false)}>Simpan Supplier</Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}