'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, CircleDollarSign, PackageCheck } from 'lucide-react'
import { useSession } from '@/lib/use-session'
import { PageIntro } from '@/components/page-intro'
import { AlertList, ALERT_TOTAL } from './alert-list'
import { MedicineSummary } from './medicine-summary'
import { NotificationPopup } from './notification-popup'
import { QuickActions } from './quick-actions'
import { SalesChart } from './sales-chart'
import { StatCard } from './stat-card'

export function Dashboard() {
  const { session } = useSession()
  const [tanggal, setTanggal] = useState('')

  useEffect(() => {
    setTanggal(
      new Date().toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      }).toUpperCase(),
    )
  }, [])

  return (
    <>
      <PageIntro
        eyebrow={tanggal}
        title={`Halo, ${session ? session.name : 'Pengguna'}`}
        subtitle="Berikut ringkasan kondisi apotek Anda hari ini."
        action={<QuickActions />}
      />

      <section className="stats-grid" aria-label="Ringkasan angka apotek">
        <StatCard
          icon={<PackageCheck />} tone="blue"
          label="Total Stok Obat" value="1.284" hint="item terdaftar"
          href="/obat" linkLabel="Kelola obat"
          sparkline={[980, 1040, 1120, 1090, 1210, 1284]}
        />
        <StatCard
          icon={<CircleDollarSign />} tone="green"
          label="Penjualan Bulan Ini" value="Rp 48,6 jt" hint="+12,8% dari bulan lalu" trend="up"
          href="/laporan" linkLabel="Buka laporan penjualan"
          sparkline={[5.3, 5.9, 6.4, 7.0, 7.8, 8.6]}
        />
        <StatCard
          icon={<AlertTriangle />} tone="amber"
          label="Perlu Perhatian" value={String(ALERT_TOTAL)} hint="obat perlu ditindaklanjuti"
          href="#perlu-perhatian" linkLabel="Lihat daftar obat yang perlu perhatian"
        />
      </section>

      <section className="dashboard-grid">
        <SalesChart />
        <AlertList headingId="perlu-perhatian" />
      </section>

      <MedicineSummary />

      <NotificationPopup />
    </>
  )
}