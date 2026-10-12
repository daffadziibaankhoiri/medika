'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Sparkline } from './sparkline'

/**
 * Kartu statistik yang bisa diklik.
 *
 * Seluruh kartu dibungkus <Link>, bukan cuma ikon, supaya area sentuhnya
 * besar dan mudah dikenali sebagai tautan. `aria-label` menyebut tujuannya
 * ("Lihat… di …") supaya pembaca layar tidak hanya_BINARY membaca angka.
 */
export function StatCard({
  icon,
  tone,
  label,
  value,
  hint,
  trend,
  href,
  linkLabel,
  sparkline,
}: {
  icon: ReactNode
  tone: 'blue' | 'green' | 'amber' | 'purple'
  label: string
  value: string
  hint: string
  trend?: 'up' | 'down' | 'flat'
  href: string
  linkLabel: string
  sparkline?: number[]
}) {
  return (
    <Link className="stat-card stat-card-link" href={href} aria-label={`${linkLabel}. ${label}: ${value}. ${hint}`}>
      <div className={`stat-icon ${tone}`} aria-hidden="true">{icon}</div>
      <div className="stat-copy">
        <p>{label}</p>
        <strong>{value}</strong>
        <span className={trend === 'up' ? 'positive' : trend === 'down' ? 'negative' : undefined}>
          {trend === 'up' && <ArrowUpRight aria-hidden="true" />}
          {hint}
        </span>
      </div>
      {sparkline && <Sparkline values={sparkline} />}
      <ArrowUpRight className="stat-card-arrow" aria-hidden="true" />
    </Link>
  )
}