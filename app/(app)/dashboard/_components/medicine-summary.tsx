'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { DataTable, Status } from '@/components/ui'
import {
  batchTerdekat, formatTanggal, obatList, sisaHari, statusObat, toneStatus, totalStok,
  type Obat,
} from '@/lib/data'

/** Jumlah baris di ringkasan dashboard. Sisanya lewat "Lihat semua obat". */
const MAKS_BARIS = 6

type Baris = { obat: Obat; total: number; /** Tanggal kedaluwarsa batch terdekat (YYYY-MM-DD). */ expiring: string | null }

/**
 * Ringkasan stok obat untuk dashboard.
 *
 * Sumber datanya `obatList` — sama dengan halaman /obat, supaya angka stok dan
 * status kadaluwarsa di dashboard tidak berbeda dari halaman detailnya.
 *
 * Berbeda dari tabel penuh, ringkasan ini sengaja read-only: tidak ada tombol
 * Hapus di halaman ringkasan. Aksi destruktif hanya muncul di /obat.
 */
export function MedicineSummary() {
  const baris = useMemo<Baris[]>(
    () =>
      obatList
        .map((obat) => ({
          obat,
          total: totalStok(obat.batches),
          // Batch terdekat yang masih punya stok; null kalau stok habis.
          expiring: batchTerdekat(obat.batches)?.kedaluwarsa ?? null,
        }))
        // Paling mendesak di atas: yang sudah lewat / paling dekat dulu.
        .sort((a, b) => (a.expiring ?? '9999').localeCompare(b.expiring ?? '9999'))
        .slice(0, MAKS_BARIS),
    [],
  )

  return (
    <section className="panel medicine-panel">
      <div className="panel-header table-title">
        <div>
          <h2>Stok Obat Terbaru</h2>
          <p>Obat yang paling perlu diperhatikan berdasarkan tanggal kedaluwarsa</p>
        </div>
        <Link className="outline-button" href="/obat">
          Lihat semua obat ({obatList.length}) <ArrowUpRight aria-hidden="true" />
        </Link>
      </div>

      <DataTable label="Ringkasan stok obat">
        <thead>
          <tr>
            <th scope="col">Nama Obat</th>
            <th scope="col">Kategori</th>
            <th scope="col">Stok</th>
            <th scope="col">Kedaluwarsa Terdekat</th>
            <th scope="col">Status FEFO</th>
          </tr>
        </thead>
        <tbody>
          {baris.length === 0 ? (
            <tr>
              <td className="obat-kosong" colSpan={5}>
                Belum ada obat terdaftar.{' '}
                <Link className="link-button" href="/obat">Tambahkan obat pertama</Link>
              </td>
            </tr>
          ) : baris.map(({ obat, total, expiring }) => {
            const status = statusObat(obat.batches)
            const sisa = expiring === null ? null : sisaHari(expiring)
            return (
              <tr key={obat.id}>
                <td>
                  <strong>{obat.nama}</strong>
                  <span className="sku">{obat.sku}</span>
                </td>
                <td>{obat.kategori}</td>
                <td><strong className={total < 30 ? 'low-stock' : undefined}>{total}</strong> unit</td>
                <td>
                  {expiring === null ? (
                    <span className="sku">Stok habis</span>
                  ) : (
                    <>
                      {formatTanggal(expiring)}
                      <span className="sku">
                        {sisa !== null && sisa < 0
                          ? `Sudah lewat ${Math.abs(sisa)} hari`
                          : `${sisa} hari lagi`}
                      </span>
                    </>
                  )}
                </td>
                <td><Status tone={toneStatus(status)}>{status}</Status></td>
              </tr>
            )
          })}
        </tbody>
      </DataTable>

      {obatList.length > MAKS_BARIS && (
        <div className="table-footer">
          Menampilkan <strong>{baris.length}</strong> dari {obatList.length} obat
        </div>
      )}
    </section>
  )
}