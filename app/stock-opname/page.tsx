'use client'

import { useState } from 'react'
import { CheckCircle2, ClipboardList, Download, Plus, Search, SlidersHorizontal, Trash2 } from 'lucide-react'
import { Button, DataTable, Status } from '@/components/ui'
import { PageIntro } from '@/components/page-intro'
import AppShell from '@/components/app-shell'

/**
 * Kerangka halaman Stock Opname.
 * Data masih statis dan seluruh aksi belum tersambung ke backend.
 */
const stockOpnameRows = [
  { code: 'SO-2024-0512', date: '12 Mei 2024', status: 'Selesai', tone: 'safe', total: '142 obat',PIC: 'Andi Wijaya' },
  { code: 'SO-2024-0508', date: '08 Mei 2024', status: 'Selesai', tone: 'safe', total: '138 obat', PIC: 'Andi Wijaya' },
  { code: 'SO-2024-0503', date: '03 Mei 2024', status: 'Diproses', tone: 'warning', total: '145 obat', PIC: 'Siti Rahayu' },
  { code: 'SO-2024-0428', date: '28 Apr 2024', status: 'Selesai', tone: 'safe', total: '136 obat', PIC: 'Andi Wijaya' },
]

export default function StockOpnamePage() {
  return (
    <AppShell>
      <StockOpname />
    </AppShell>
  )
}

function StockOpname() {
  const [query, setQuery] = useState('')

  const filtered = stockOpnameRows.filter((row) =>
    row.code.toLowerCase().includes(query.toLowerCase()) ||
    row.PIC.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <>
      <PageIntro
        title="Stock Opname"
        subtitle="Catat dan telusuri hasil stock opname apotek."
        action={<Button secondary><Download /> Export Opname</Button>}
      />

      <section className="panel">
        <div className="table-toolbar">
          <div className="search-box">
            <Search aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari kode opname atau PIC..."
              aria-label="Cari kode opname atau penanggung jawab"
            />
          </div>
          <button className="filter-button"><SlidersHorizontal aria-hidden="true" /> Filter</button>
        </div>

        <DataTable>
          <thead>
            <tr>
              <th>Kode Opname</th>
              <th>Tanggal</th>
              <th>PIC</th>
              <th>Total Item</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.code}>
                <td><strong>{row.code}</strong></td>
                <td>{row.date}</td>
                <td>{row.PIC}</td>
                <td>{row.total}</td>
                <td><Status tone={row.tone}>{row.status}</Status></td>
                <td>
                  <button className="table-action" aria-label={`Lihat detail ${row.code}`}>
                    <ClipboardList />
                  </button>
                  <button className="table-action danger-action" aria-label={`Hapus ${row.code}`}>
                    <Trash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>

        {filtered.length === 0 && (
          <div className="table-footer">
            Menampilkan <strong>0</strong> opname
          </div>
        )}
      </section>

      <section className="panel restock-panel">
        <div className="panel-header">
          <div>
            <h2>Selisih Stok Terakhir</h2>
            <p>Ringkasan selisih fisik terhadap sistem pada opname terakhir</p>
          </div>
        </div>
        <DataTable>
          <thead>
            <tr>
              <th>Obat</th>
              <th>Stok Sistem</th>
              <th>Stok Fisik</th>
              <th>Selisih</th>
              <th>Keterangan</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Amoxicillin 500mg</strong></td>
              <td>24 box</td>
              <td>22 box</td>
              <td><strong className="low-stock">-2 box</strong></td>
              <td>Kerusakan kemasan</td>
            </tr>
            <tr>
              <td><strong>Paracetamol 500mg</strong></td>
              <td>156 box</td>
              <td>156 box</td>
              <td><CheckCircle2 aria-hidden="true" /> 0</td>
              <td>Sesuai</td>
            </tr>
            <tr>
              <td><strong>Cetirizine 10mg</strong></td>
              <td>18 box</td>
              <td>19 box</td>
              <td><strong>+1 box</strong></td>
              <td>Retur resep</td>
            </tr>
          </tbody>
        </DataTable>
      </section>

      <div className="settings-actions">
        <Button><Plus /> Buat Opname Baru</Button>
      </div>
    </>
  )
}