'use client'

/**
 * Sparkline dekoratif untuk kartu statistik.
 *
 * Murni visual — nilai yang sebenarnya sudah tertulis di kartu, jadi tidak
 * perlu diumumkan ke pembaca layar (aria-hidden). Dinormalkan supaya tren
 * dengan nilai besar dan nilai kecil tetap terbentuk sama.
 */
export function Sparkline({ values, width = 72, height = 26 }: { values: number[]; width?: number; height?: number }) {
  if (values.length < 2) return null

  const min = Math.min(...values)
  const max = Math.max(...values)
  const rentang = max - min || 1
  const step = width / (values.length - 1)

  const points = values.map((value, index) => {
    const x = index * step
    // Margin 2px supaya garis tidak menempel tepi kotak.
    const y = height - 2 - ((value - min) / rentang) * (height - 4)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })

  return (
    <svg className="sparkline" width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" focusable="false">
      <polyline points={points.join(' ')} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}