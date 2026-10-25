'use client'

import { useMemo, useState } from 'react'
import {
  AlertTriangle, ArrowUpRight, Minus, Plus, PlusCircle, Search, ShieldAlert, ShoppingCart,
} from 'lucide-react'
import { Button } from '@/components/ui'
import { PageIntro } from '@/components/page-intro'
import {
  formatTanggal, money, obatList, pilihBatchFEFO, sisaHari, sudahKedaluwarsa,
  semuaBatchKedaluwarsa, statusBatch, type Obat,
} from '@/lib/data'
import { useSession } from '@/lib/use-session'
import { useAlert } from '@/lib/use-alert'

type CartItem = {
  id: string
  nama: string
  sku: string
  lot: string
  kedaluwarsa: string
  harga: number
  qty: number
}

export default function Kasir() {
  const { session } = useSession()
  const alert = useAlert()
  const [cart, setCart] = useState<CartItem[]>([])
  const [search, setSearch] = useState('')
  const [ditolak, setDitolak] = useState<string[]>([])

  const results = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (q === '') return obatList
    return obatList.filter(
      (obat) => obat.nama.toLowerCase().includes(q) || obat.sku.toLowerCase().includes(q),
    )
  }, [search])

  const total = cart.reduce((sum, item) => sum + item.harga * item.qty, 0)

  /**
   * Tambah obat ke keranjang.
   * Batch dipilih otomatis dengan aturan FEFO: yang terdekat kedaluwarsanya
   * dan BELUM kedaluwarsa. Bila tidak ada batch seperti itu, obat masuk ke
   * daftar "ditolak" dan transaksi tidak bisa disimpan.
   */
  function tambahKeKeranjang(obat: Obat) {
    const batch = pilihBatchFEFO(obat.batches)

    if (!batch) {
      setDitolak((current) =>
        current.includes(obat.nama) ? current : [...current, obat.nama],
      )
      return
    }

    // Batalkan penolakan bila obat yang sama sebelumnya ditolak tapi kini punya batch.
    setDitolak((current) => current.filter((nama) => nama !== obat.nama))

    setCart((current) => {
      const sudah = current.find((item) => item.lot === batch.lot)
      if (sudah) {
        return current.map((item) =>
          item.lot === batch.lot ? { ...item, qty: item.qty + 1 } : item,
        )
      }
      return [
        ...current,
        {
          id: obat.id,
          nama: obat.nama,
          sku: obat.sku,
          lot: batch.lot,
          kedaluwarsa: batch.kedaluwarsa,
          harga: obat.hargaJual,
          qty: 1,
        },
      ]
    })
  }

  function ubahQty(lot: string, delta: number) {
    setCart((current) =>
      current
        .map((item) => (item.lot === lot ? { ...item, qty: item.qty + delta } : item))
        .filter((item) => item.qty > 0),
    )
  }

  function hapusItem(lot: string) {
    setCart((current) => current.filter((item) => item.lot !== lot))
  }

  const terblokir = ditolak.length > 0
  const simpanNonaktif = cart.length === 0 || terblokir

  return (
    <>
      <PageIntro
        title="Kasir / Transaksi"
        subtitle="Batch dipilih otomatis dengan aturan FEFO: yang terdekat kedaluwarsanya dan belum kedaluwarsa."
      />

      {terblokir && (
        <div className="kasir-alert" role="alert" aria-live="assertive">
          <ShieldAlert aria-hidden="true" />
          <div>
            <strong>Transaksi ditolak: obat kedaluwarsa</strong>
            <p>
              Seluruh batch untuk {ditolak.join(', ')} sudah kedaluwarsa, sehingga obat tidak
              boleh dijual dan tidak masuk ke keranjang. Selesaikan transaksi tanpa obat tersebut,
              atau hubungi Owner apotek untuk membuka blokir stok.
            </p>
            <button
              type="button"
              className="kasir-alert-tutup"
              onClick={() => setDitolak([])}
            >
              Lanjutkan tanpa obat ini
            </button>
          </div>
        </div>
      )}

      <div className="cashier-grid">
        <section className="panel">
          <h2>Tambah Obat ke Transaksi</h2>
          <p className="panel-note">Cari obat berdasarkan nama atau SKU</p>

          <div className="search-box wide">
            <Search aria-hidden="true" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari obat..."
              aria-label="Cari obat berdasarkan nama atau SKU"
            />
          </div>

          <div className="medicine-results">
            {results.map((obat) => {
              const batch = pilihBatchFEFO(obat.batches)
              const tidakLayak = semuaBatchKedaluwarsa(obat.batches)
              const stokTersedia = obat.batches
                .filter((b) => !sudahKedaluwarsa(b.kedaluwarsa))
                .reduce((sum, b) => sum + b.stok, 0)

              return (
                <button
                  key={obat.id}
                  type="button"
                  className={`result-row ${tidakLayak ? 'ditolak' : ''}`}
                  onClick={() => tambahKeKeranjang(obat)}
                  aria-label={
                    tidakLayak
                      ? `${obat.nama} tidak dapat dijual karena seluruh batch kedaluwarsa`
                      : `Tambah ${obat.nama}, batch ${batch?.lot} ke transaksi`
                  }
                >
                  <span>
                    <strong>{obat.nama}</strong>
                    <small>
                      {obat.kategori} · Stok {stokTersedia}
                      {batch ? ` · FEFO: ${batch.lot}` : ' · tidak ada batch layak jual'}
                    </small>
                  </span>
                  <b>{money(obat.hargaJual)}</b>
                  {tidakLayak ? <AlertTriangle aria-hidden="true" /> : <PlusCircle aria-hidden="true" />}
                </button>
              )
            })}

            {results.length === 0 && <p className="kasir-kosong">Tidak ada obat yang cocok.</p>}
          </div>
        </section>

        <section className="panel cart-panel">
          <div className="panel-header">
            <div>
              <h2>Detail Transaksi</h2>
              <p>Kasir: {session ? session.name : 'Kelompok 5'}</p>
            </div>
            <span className="transaction-id">#TRX-260914</span>
          </div>

          {cart.length === 0 ? (
            <div className="empty-cart">
              <ShoppingCart aria-hidden="true" />
              <p>Belum ada obat dipilih</p>
              <span>Pilih obat dari daftar untuk memulai transaksi</span>
            </div>
          ) : (
            <div className="cart-list">
              {cart.map((item) => {
                const status = statusBatch(item.kedaluwarsa)
                const sisa = sisaHari(item.kedaluwarsa)
                return (
                  <div className="cart-row" key={item.lot}>
                    <div>
                      <strong>{item.nama}</strong>
                      <span className="cart-batch">
                        <span className="cart-batch-lot">Batch {item.lot}</span>
                        <span>Kedaluwarsa {formatTanggal(item.kedaluwarsa)}</span>
                        <span className={`cart-batch-status ${status.toLowerCase()}`}>
                          {status} · {sisa} hari lagi
                        </span>
                      </span>
                      <span>{money(item.harga)}</span>
                    </div>

                    <div className="qty">
                      <button
                        type="button"
                        onClick={() => ubahQty(item.lot, -1)}
                        aria-label={`Kurangi jumlah ${item.nama} batch ${item.lot}`}
                      ><Minus aria-hidden="true" /></button>
                      <b>{item.qty}</b>
                      <button
                        type="button"
                        onClick={() => ubahQty(item.lot, 1)}
                        aria-label={`Tambah jumlah ${item.nama} batch ${item.lot}`}
                      ><Plus aria-hidden="true" /></button>
                    </div>

                    <strong>{money(item.harga * item.qty)}</strong>

                    <button
                      type="button"
                      className="cart-remove"
                      onClick={() => hapusItem(item.lot)}
                      aria-label={`Hapus ${item.nama} batch ${item.lot} dari transaksi`}
                    >Hapus</button>
                  </div>
                )
              })}
            </div>
          )}

          <div className="total-box">
            <span>Total Pembayaran</span>
            <strong>{money(total)}</strong>
          </div>

          <button
            type="button"
            className="primary-button kasir-simpan"
            disabled={simpanNonaktif}
            onClick={() => {
              if (!simpanNonaktif) {
                setCart([])
                setDitolak([])
                alert.success('Transaksi berhasil disimpan')
              }
            }}
          >
            Simpan Transaksi <ArrowUpRight aria-hidden="true" />
          </button>

          {terblokir && (
            <p className="kasir-alert-note">
              Simpan Transaksi dinonaktifkan selama ada obat kedaluwarsa yang ditolak.
            </p>
          )}
        </section>
      </div>
    </>
  )
}