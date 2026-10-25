'use client'

import { useEffect, useId, useMemo, useState } from 'react'
import { AlertTriangle, Send } from 'lucide-react'
import { Field, Modal } from '@/components/ui'
import { formatTanggal, obatList, statusBatch, suppliers, type Batch, type Obat } from '@/lib/data'
import { useSession } from '@/lib/use-session'
import { useReturns } from '@/lib/use-returns'
import {
  ALASAN_RETUR,
  createRetur,
  stokBatchSetelahRetur,
  type AlasanRetur,
  type Retur,
} from '@/lib/returns'

type KandidatBatch = {
  key: string
  obat: Obat
  batch: Batch
}

type FieldRetur = 'batch' | 'supplier' | 'jumlah' | 'alasan' | 'catatan'
type ErrorsRetur = Partial<Record<FieldRetur, string>>

function idBatch(obatId: string, nomorBatch: string): string {
  return `${obatId}:${nomorBatch}`
}

export function SupplierReturnDialog({
  initialObatId,
  initialNomorBatch,
  onClose,
  onSubmitted,
}: {
  initialObatId?: string
  initialNomorBatch?: string
  onClose: () => void
  onSubmitted?: (retur: Retur) => void
}) {
  const idPrefix = useId()
  const { session } = useSession()
  const { daftar } = useReturns()
  const [errors, setErrors] = useState<ErrorsRetur>({})

  const kandidat = useMemo<KandidatBatch[]>(() => {
    const items = obatList.flatMap((obat) =>
      obat.batches.map((batch) => ({
        key: idBatch(obat.id, batch.lot),
        obat,
        batch,
      })),
    )
    return items.sort((a, b) => {
      const kedaluwarsaA = statusBatch(a.batch.kedaluwarsa) === 'Kadaluwarsa'
      const kedaluwarsaB = statusBatch(b.batch.kedaluwarsa) === 'Kadaluwarsa'
      if (kedaluwarsaA !== kedaluwarsaB) return kedaluwarsaA ? -1 : 1
      return a.batch.kedaluwarsa.localeCompare(b.batch.kedaluwarsa)
    })
  }, [])

  const pilihanAwal = kandidat.find(
    (item) =>
      item.obat.id === initialObatId && item.batch.lot === initialNomorBatch,
  )

  const [batchTerpilih, setBatchTerpilih] = useState(pilihanAwal?.key ?? '')
  const [supplier, setSupplier] = useState(pilihanAwal?.batch.supplier ?? '')
  const [jumlah, setJumlah] = useState('')
  const [alasan, setAlasan] = useState<AlasanRetur | ''>('')
  const [catatan, setCatatan] = useState('')

  useEffect(() => {
    const awal = obatList
      .flatMap((obat) =>
        obat.batches.map((batch) => ({
          key: idBatch(obat.id, batch.lot),
          obat,
          batch,
        })),
      )
      .find(
        (item) =>
          item.obat.id === initialObatId && item.batch.lot === initialNomorBatch,
      )
    setBatchTerpilih(awal?.key ?? '')
    setSupplier(awal?.batch.supplier ?? '')
    setJumlah('')
    setAlasan('')
    setCatatan('')
    setErrors({})
  }, [initialNomorBatch, initialObatId])

  const terpilih = kandidat.find((item) => item.key === batchTerpilih)
  const stokTersedia = terpilih
    ? stokBatchSetelahRetur(terpilih.batch.stok, terpilih.key, daftar)
    : 0

  function pilihBatch(key: string) {
    const item = kandidat.find((kandidatItem) => kandidatItem.key === key)
    setBatchTerpilih(key)
    setSupplier(item?.batch.supplier ?? '')
    setJumlah('')
    setErrors((current) => ({ ...current, batch: undefined, supplier: undefined, jumlah: undefined }))
  }

  function validasi(): ErrorsRetur {
    const hasil: ErrorsRetur = {}
    if (!terpilih) hasil.batch = 'Pilih batch obat yang akan diretur.'
    if (!supplier.trim()) hasil.supplier = 'Supplier wajib diisi.'
    if (!jumlah.trim()) {
      hasil.jumlah = 'Jumlah retur wajib diisi.'
    } else {
      const nilai = Number(jumlah)
      if (!Number.isInteger(nilai) || nilai <= 0) {
        hasil.jumlah = 'Jumlah retur harus berupa bilangan bulat lebih dari 0.'
      } else if (nilai > stokTersedia) {
        hasil.jumlah = `Jumlah retur tidak boleh melebihi stok batch (${stokTersedia} unit).`
      }
    }
    if (!alasan) hasil.alasan = 'Alasan retur wajib dipilih.'
    if (!catatan.trim()) hasil.catatan = 'Catatan retur wajib diisi.'
    return hasil
  }

  function ajukan(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const hasil = validasi()
    setErrors(hasil)
    if (Object.keys(hasil).length > 0 || !terpilih || !alasan) return

    const retur = createRetur({
      idBatch: terpilih.key,
      namaObat: terpilih.obat.nama,
      nomorBatch: terpilih.batch.lot,
      supplier: supplier.trim(),
      jumlah: Number(jumlah),
      alasan,
      namaPengaju: session?.name ?? 'Pengguna Demo',
      catatan: catatan.trim(),
    })
    onSubmitted?.(retur)
    onClose()
  }

  const errorId = (field: FieldRetur) => `${idPrefix}-${field}-error`

  return (
    <Modal
      title="Ajukan Retur ke Supplier"
      description="Pilih batch, isi alasan, lalu catat jumlah obat yang dikembalikan."
      onClose={onClose}
    >
      <form className="modal-form retur-form" onSubmit={ajukan} noValidate>
        {Object.keys(errors).length > 0 && (
          <div className="form-error" role="alert">
            <AlertTriangle aria-hidden="true" />
            <span>Periksa kembali field retur yang belum valid.</span>
          </div>
        )}

        <Field label="Batch obat" htmlFor={`${idPrefix}-batch`}>
          <select
            id={`${idPrefix}-batch`}
            value={batchTerpilih}
            onChange={(event) => pilihBatch(event.target.value)}
            aria-invalid={errors.batch ? true : undefined}
            aria-describedby={errors.batch ? errorId('batch') : undefined}
            required
          >
            <option value="">-- Pilih batch --</option>
            {kandidat.map((item) => {
              const kedaluwarsa = statusBatch(item.batch.kedaluwarsa) === 'Kadaluwarsa'
              const stok = stokBatchSetelahRetur(item.batch.stok, item.key, daftar)
              return (
                <option key={item.key} value={item.key}>
                  {kedaluwarsa ? '[Kedaluwarsa] ' : ''}{item.obat.nama} — {item.batch.lot} — stok {stok}
                </option>
              )
            })}
          </select>
        </Field>
        {errors.batch && <p className="auth-field-error" id={errorId('batch')}>{errors.batch}</p>}

        <Field label="Supplier" htmlFor={`${idPrefix}-supplier`}>
          <select
            id={`${idPrefix}-supplier`}
            value={supplier}
            onChange={(event) => setSupplier(event.target.value)}
            aria-invalid={errors.supplier ? true : undefined}
            aria-describedby={errors.supplier ? errorId('supplier') : undefined}
            required
          >
            <option value="">-- Pilih supplier --</option>
            {suppliers.map((item) => (
              <option key={item.name} value={item.name}>{item.name}</option>
            ))}
          </select>
        </Field>
        {errors.supplier && <p className="auth-field-error" id={errorId('supplier')}>{errors.supplier}</p>}

        <div className="form-grid">
          <Field label="Jumlah retur" htmlFor={`${idPrefix}-jumlah`}>
            <input
              id={`${idPrefix}-jumlah`}
              type="number"
              min="1"
              max={Math.max(stokTersedia, 0)}
              step="1"
              value={jumlah}
              onChange={(event) => setJumlah(event.target.value)}
              aria-invalid={errors.jumlah ? true : undefined}
              aria-describedby={errors.jumlah ? errorId('jumlah') : undefined}
              required
            />
          </Field>
          <Field label="Alasan retur" htmlFor={`${idPrefix}-alasan`}>
            <select
              id={`${idPrefix}-alasan`}
              value={alasan}
              onChange={(event) => setAlasan(event.target.value as AlasanRetur | '')}
              aria-invalid={errors.alasan ? true : undefined}
              aria-describedby={errors.alasan ? errorId('alasan') : undefined}
              required
            >
              <option value="">-- Pilih alasan --</option>
              {ALASAN_RETUR.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </Field>
        </div>
        {errors.jumlah && <p className="auth-field-error" id={errorId('jumlah')}>{errors.jumlah}</p>}
        {errors.alasan && <p className="auth-field-error" id={errorId('alasan')}>{errors.alasan}</p>}

        <Field label="Catatan" htmlFor={`${idPrefix}-catatan`}>
          <textarea
            id={`${idPrefix}-catatan`}
            className="opname-textarea"
            value={catatan}
            onChange={(event) => setCatatan(event.target.value)}
            aria-invalid={errors.catatan ? true : undefined}
            aria-describedby={errors.catatan ? errorId('catatan') : undefined}
            required
          />
        </Field>
        {errors.catatan && <p className="auth-field-error" id={errorId('catatan')}>{errors.catatan}</p>}

        {terpilih && (
          <div className="retur-info">
            <AlertTriangle aria-hidden="true" />
            <span>
              Batch <strong>{terpilih.batch.lot}</strong> memiliki tanggal kedaluwarsa{' '}
              {formatTanggal(terpilih.batch.kedaluwarsa)}. Stok saat ini {stokTersedia} unit.
            </span>
          </div>
        )}

        <div className="modal-actions">
          <button className="outline-button" type="button" onClick={onClose}>Batal</button>
          <button className="primary-button" type="submit">
            <Send aria-hidden="true" /> Ajukan Retur
          </button>
        </div>
      </form>
    </Modal>
  )
}
