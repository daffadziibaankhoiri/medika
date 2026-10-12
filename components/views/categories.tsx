'use client'

import { useMemo, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Button, DataTable, EmptyRow, Field, Modal } from '@/components/ui'
import { PageIntro } from '@/components/page-intro'
import { categories, obatList } from '@/lib/data'

export function Categories() {
  const [items, setItems] = useState<string[]>(categories)
  const [open, setOpen] = useState(false)
  const [editItem, setEditItem] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  // Jumlah obat dihitung dari data yang sama dengan halaman /obat, bukan
  // angka karangan, supaya tidak terlihat seperti data asli yang random.
  const jumlahPerKategori = useMemo(() => {
    const map = new Map<string, number>()
    for (const obat of obatList) {
      map.set(obat.kategori, (map.get(obat.kategori) ?? 0) + 1)
    }
    return map
  }, [])

  function add() {
    const bersih = name.trim()
    if (!bersih) return setError('Nama kategori tidak boleh kosong.')
    if (items.some((item) => item.toLowerCase() === bersih.toLowerCase())) {
      return setError(`Kategori “${bersih}” sudah ada.`)
    }
    setItems([...items, bersih])
    setName('')
    setError('')
    setOpen(false)
  }

  return (
    <>
      <PageIntro
        title="Kategori Obat"
        subtitle="Kelola kategori dan jenis obat untuk inventaris apotek."
        action={<Button onClick={() => { setName(''); setError(''); setOpen(true) }}><Plus aria-hidden="true" /> Tambah Kategori</Button>}
      />

      <section className="panel">
        <DataTable label="Daftar kategori obat">
          <thead>
            <tr>
              <th scope="col">Nama Kategori</th>
              <th scope="col">Jumlah Obat</th>
              <th scope="col">Deskripsi</th>
              <th scope="col">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <EmptyRow colSpan={4}>Belum ada kategori. Tambahkan kategori pertama untuk mengelompokkan obat.</EmptyRow>
            ) : items.map((item) => {
              const jumlah = jumlahPerKategori.get(item) ?? 0
              return (
                <tr key={item}>
                  <td><strong>{item}</strong></td>
                  <td>
                    {jumlah} obat
                    {jumlah === 0 && <span className="sku">belum ada obat</span>}
                  </td>
                  <td>{deskripsi(item)}</td>
                  <td>
                    <button
                      type="button"
                      className="table-action"
                      onClick={() => setEditItem(item)}
                      aria-label={`Edit kategori ${item}`}
                    >
                      <Pencil aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="table-action danger-action"
                      onClick={() => setItems(items.filter((x) => x !== item))}
                      aria-label={`Hapus kategori ${item}`}
                    >
                      <Trash2 aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </DataTable>
      </section>

      {editItem && (
        <Modal
          title="Edit Kategori"
          description="Perbarui nama kategori obat."
          onClose={() => setEditItem(null)}
        >
          <div className="modal-form">
            <Field label="Nama kategori" htmlFor="edit-kategori">
              <input
                id="edit-kategori"
                autoFocus
                value={editItem}
                onChange={(event) => setEditItem(event.target.value)}
              />
            </Field>
            <div className="modal-actions">
              <Button secondary onClick={() => setEditItem(null)}>Batal</Button>
              <Button
                onClick={() => {
                  const bersih = editItem.trim()
                  if (!bersih) return
                  if (items.some((x) => x !== editItem && x.toLowerCase() === bersih.toLowerCase())) {
                    setError(`Kategori “${bersih}” sudah ada.`)
                    return
                  }
                  setItems(items.map((item) => (item === categories.find((c) => c === editItem) ? bersih : item)))
                  setError('')
                  setEditItem(null)
                }}
              >
                Simpan Perubahan
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {open && (
        <Modal
          title="Tambah Kategori"
          description="Buat kategori baru untuk pengelompokan obat."
          onClose={() => setOpen(false)}
        >
          <div className="modal-form">
            <Field label="Nama kategori" htmlFor="baru-kategori">
              <input
                id="baru-kategori"
                autoFocus
                value={name}
                onChange={(event) => setName(event.target.value)}
                onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); add() } }}
                placeholder="Contoh: Obat bebas"
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? 'kategori-error' : undefined}
              />
            </Field>
            <div aria-live="assertive" aria-atomic="true">
              {error && (
                <p className="auth-message error" id="kategori-error">
                  <span>{error}</span>
                </p>
              )}
            </div>
            <div className="modal-actions">
              <Button secondary onClick={() => setOpen(false)}>Batal</Button>
              <Button onClick={add}>Simpan Kategori</Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}

/** Deskripsi singkat per kategori. Diturunkan dari nama, bukan teks karangan. */
function deskripsi(item: string): string {
  const bawaan: Record<string, string> = {
    Antibiotik: 'Obat antibiotik, butuh resep dan catatan batch yang rapi.',
    Analgesik: 'Obat pereda nyeri dan penurun panas.',
    Antialergi: 'Obat untuk gejala alergi.',
    Lambung: 'Obat untuk keluhan saluran pencernaan.',
    Vitamin: 'Vitamin dan suplemen Plex. Tidak butuh resep.',
  }
  return bawaan[item] ?? `Kelompok obat ${item.toLowerCase()}.`
}