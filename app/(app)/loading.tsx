/**
 * Skeleton saat halaman di dalam shell sedang dimuat.
 *
 * Bentuknya sengaja meniru kerangka dashboard (4 kartu statistik + 2 panel)
 * supaya transisi ke halaman asli tidak terasa "melompat". Placeholder-nya
 * murni dekoratif, jadi disembunyikan dari teknologi bantu dengan aria-hidden.
 * `role="status"` dipakai sekali saja supaya pembaca layar diberi tahu bahwa
 * memuat, bukan announces setiap potongan kerangka.
 */
export default function AppLoading() {
  return (
    <div className="page-skeleton" role="status" aria-live="polite">
      <span className="sr-only">Memuat halaman…</span>

      <div className="page-heading" aria-hidden="true">
        <div>
          <div className="skeleton skeleton-eyebrow" />
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-line" />
        </div>
      </div>

      <div className="stats-grid" aria-hidden="true">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="stat-card">
            <div className="skeleton skeleton-icon" />
            <div className="stat-copy">
              <div className="skeleton skeleton-label" />
              <div className="skeleton skeleton-number" />
              <div className="skeleton skeleton-line" />
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid" aria-hidden="true">
        <div className="panel">
          <div className="skeleton skeleton-label" />
          <div className="skeleton skeleton-block" />
        </div>
        <div className="panel">
          <div className="skeleton skeleton-label" />
          <div className="skeleton skeleton-block" />
        </div>
      </div>
    </div>
  )
}