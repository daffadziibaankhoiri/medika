'use client'

import { useState } from 'react'
import { Minus, Plus, RotateCcw } from 'lucide-react'
import {
  growthOf, ringkasJuta, rupiah, totalOf, SALES_PERIODS,
  type SalesPeriod, type SalesPeriodKey,
} from './sales-data'

const W = 700
const H = 240
const PAD_TOP = 12
const PAD_BOTTOM = 26
const TICKS = 5

/** Bulatkan batas atas ke angka "bulat" supaya label sumbu enak dibaca. */
function niceMax(value: number): number {
  if (value <= 0) return 1
  const magnitude = 10 ** Math.floor(Math.log10(value))
  const steps = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]
  return (steps.find((step) => value <= step * magnitude) ?? 10) * magnitude
}

/**
 * Grafik penjualan beserta pemilih periodenya.
 *
 * Aksesibilitas:
 *  - Setiap titik adalah <button> sungguhan, jadi bisa dicapai Tab dan dibaca
 *    sebagai "Maret, Rp 8.100.000". Hasil hover dan fokus keyboard identik.
 *  - Panah kiri/kanan memindah titik, Plus/Minus mengubah skala, Reset
 *    mengembalikan rentang penuh.
 *  - Di bawah grafik ada tabel angka lengkap, karena grafik saja tidak bisa
 *    dibaca teknologi bantu.
 *
 * Sumbu Y dihitung dari data periode yang dipilih, bukan label tetap, supaya
 * grafik "Bulan Ini" tidak lagi memakai skala "50jt".
 */
export function SalesChart() {
  const [periode, setPeriode] = useState<SalesPeriodKey>('enam-bulan')
  const [aktif, setAktif] = useState<number | null>(null)
  const [zoom, setZoom] = useState(1)

  const period = SALES_PERIODS.find((item) => item.key === periode) ?? SALES_PERIODS[0]
  const total = totalOf(period.values)
  const growth = growthOf(period)
  const naik = growth >= 0

  const max = niceMax(Math.max(...period.values)) * zoom
  const tinggi = H - PAD_TOP - PAD_BOTTOM

  const titik = period.values.map((value, index) => {
    const x = period.values.length === 1 ? W / 2 : (index / (period.values.length - 1)) * W
    const y = PAD_TOP + tinggi - (value / max) * tinggi
    return { x, y, value, label: period.labels[index] }
  })

  const garis = titik.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
  const area = `${garis} L${W} ${PAD_TOP + tinggi} L0 ${PAD_TOP + tinggi} Z`
  const tickValues = Array.from({ length: TICKS }, (_, i) => (max / (TICKS - 1)) * (TICKS - 1 - i))

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const last = period.values.length - 1
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault()
      const next = aktif === null
        ? (event.key === 'ArrowRight' ? 0 : last)
        : Math.min(last, Math.max(0, aktif + (event.key === 'ArrowRight' ? 1 : -1)))
      setAktif(next)
      document.getElementById(`sales-point-${next}`)?.focus()
      return
    }
    if (event.key === '+' || event.key === '=') {
      event.preventDefault()
      setZoom((z) => Math.min(3, +(z + 0.5).toFixed(1)))
      return
    }
    if (event.key === '-' || event.key === '_') {
      event.preventDefault()
      setZoom((z) => Math.max(1, +(z - 0.5).toFixed(1)))
      return
    }
    if (event.key === 'Home') {
      event.preventDefault()
      setZoom(1)
    }
  }

  return (
    <section className="panel sales-panel">
      <div className="panel-header">
        <div>
          <h2>Ringkasan Penjualan</h2>
          <p>{period.label}</p>
        </div>

        <div className="chart-head-controls">
          {/* Native <select>, bukan listbox buatan sendiri: navigasi panah,
              Escape, dan pembaca layar sudah benar tanpa kode tambahan. */}
          <div className="chart-picker">
            <label className="sr-only" htmlFor="sales-period">Periode penjualan</label>
            <select
              id="sales-period"
              value={periode}
              onChange={(event) => setPeriode(event.target.value as SalesPeriodKey)}
            >
              {SALES_PERIODS.map((item) => (
                <option key={item.key} value={item.key}>{item.label}</option>
              ))}
            </select>
          </div>

          <div className="chart-tools" role="group" aria-label="Kendali tampilan grafik">
            <button type="button" className="chart-tool" onClick={() => setZoom((z) => Math.min(3, +(z + 0.5).toFixed(1)))} aria-label="Perbesar grafik" disabled={zoom >= 3}>
              <Plus aria-hidden="true" />
            </button>
            <button type="button" className="chart-tool" onClick={() => setZoom((z) => Math.max(1, +(z - 0.5).toFixed(1)))} aria-label="Perkecil grafik" disabled={zoom <= 1}>
              <Minus aria-hidden="true" />
            </button>
            <button type="button" className="chart-tool" onClick={() => setZoom(1)} aria-label="Kembalikan tampilan ke rentang penuh" disabled={zoom === 1}>
              <RotateCcw aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <div className="sales-total">
        <strong>{rupiah(total)}</strong>
        <span className={naik ? 'positive' : 'negative'} role="status" aria-atomic="true">
          {naik ? '+' : ''}{growth.toLocaleString('id-ID', { maximumFractionDigits: 1 })}%
          <em>dari {period.compareLabel}</em>
        </span>
        {zoom > 1 && <span className="chart-zoom" aria-hidden="true">{Math.round(zoom * 100)}%</span>}
      </div>

      <div className="chart" onKeyDown={onKeyDown}>
        <div className="chart-y" aria-hidden="true">
          {tickValues.map((value, i) => <span key={i}>{ringkasJuta(value)}</span>)}
        </div>

        <div className="chart-area">
          <div className="grid-lines" aria-hidden="true">
            {Array.from({ length: TICKS }, (_, i) => <i key={i} />)}
          </div>

          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={deskripsiGrafik(period, total, growth, naik)} className="chart-svg">
            <defs>
              <linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity=".26" />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={area} fill="url(#chart-fill)" />
            <path
              d={garis}
              fill="none"
              stroke="var(--primary)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {/*
            Titik-titik focusable diletakkan sebagai button di atas SVG supaya
            hover, fokus keyboard, dan pembaca layar memakai elemen yang sama.
          */}
          {titik.map((p, i) => (
            <button
              key={`${p.label}-${i}`}
              id={`sales-point-${i}`}
              type="button"
              className={`chart-point ${aktif === i ? 'active' : ''}`}
              style={{ left: `${(p.x / W) * 100}%`, top: `${(p.y / H) * 100}%` }}
              aria-label={`${p.label}: ${rupiah(p.value)}`}
              onMouseEnter={() => setAktif(i)}
              onMouseLeave={() => setAktif(null)}
              onFocus={() => setAktif(i)}
              onBlur={() => setAktif(null)}
            >
              <span className="chart-tooltip" aria-hidden="true">
                <strong>{p.label}</strong>
                <span>{rupiah(p.value)}</span>
              </span>
            </button>
          ))}

          <div className="chart-x" aria-hidden="true">
            {period.labels.map((label) => <span key={label}>{label}</span>)}
          </div>
        </div>
      </div>

      <details className="chart-data">
        <summary>Lihat angka penjualan</summary>
        <div className="table-scroll" role="region" aria-label="Tabel angka penjualan" tabIndex={0}>
          <table>
            <caption className="sr-only">
              Penjualan {period.label} dibandingkan {period.compareLabel}
            </caption>
            <thead>
              <tr>
                <th scope="col">Periode</th>
                <th scope="col">{period.label}</th>
                <th scope="col">{period.compareLabel}</th>
                <th scope="col">Perubahan</th>
              </tr>
            </thead>
            <tbody>
              {period.labels.map((label, i) => {
                const delta = ((period.values[i] - period.previous[i]) / period.previous[i]) * 100
                return (
                  <tr key={label}>
                    <th scope="row">{label}</th>
                    <td>{rupiah(period.values[i])}</td>
                    <td>{rupiah(period.previous[i])}</td>
                    <td>{pct(delta)}</td>
                  </tr>
                )
              })}
              <tr className="chart-total-row">
                <th scope="row">Total</th>
                <td>{rupiah(total)}</td>
                <td>{rupiah(totalOf(period.previous))}</td>
                <td>{pct(growth)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </details>
    </section>
  )
}

const pct = (value: number) =>
  `${value >= 0 ? '+' : ''}${value.toLocaleString('id-ID', { maximumFractionDigits: 1 })}%`

function deskripsiGrafik(
  period: SalesPeriod,
  total: number,
  growth: number,
  naik: boolean,
): string {
  const arah = naik ? 'naik' : 'turun'
  return `Grafik penjualan ${period.label}, total ${rupiah(total)}, ${arah} ${Math.abs(growth).toLocaleString('id-ID', { maximumFractionDigits: 1 })}% dari ${period.compareLabel}. Tabel angka lengkap tersedia di bawah grafik.`
}