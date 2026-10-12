'use client'

import { useState } from 'react'
import { ClipboardList, Undo2 } from 'lucide-react'
import { PageIntro } from '@/components/page-intro'
import { PanelOpname } from './panel-opname'
import { PanelRetur } from './panel-retur'
import type { Tab } from './types'

/**
 * Kerangka tab Stock Opname.
 *
 * Panah kiri/kanan berpindah tab dan HOME/END ke tab pertama/terakhir,
 * sesuai pola tab ARIA. Tanpa ini, tab hanya bisa dicapai lewat Tab.
 */
const TABS: { id: Tab; label: string; icon: typeof ClipboardList }[] = [
  { id: 'opname', label: 'Stock Opname', icon: ClipboardList },
  { id: 'retur', label: 'Retur ke Supplier', icon: Undo2 },
]

export function StockOpname() {
  const [tab, setTab] = useState<Tab>('opname')

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const offset = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
    if (offset === 0 && event.key !== 'Home' && event.key !== 'End') return

    const index = TABS.findIndex((item) => item.id === tab)
    const next =
      event.key === 'Home' ? 0
        : event.key === 'End' ? TABS.length - 1
          : (index + offset + TABS.length) % TABS.length

    event.preventDefault()
    setTab(TABS[next].id)
    document.getElementById(`tab-${TABS[next].id}`)?.focus()
  }

  return (
    <>
      <PageIntro
        title="Stock Opname"
        subtitle="Cocokkan stok sistem dengan stok fisik, lalu ajukan retur obat kedaluwarsa ke supplier."
      />

      <div className="tabs" role="tablist" aria-label="Menu stock opname" onKeyDown={onKeyDown}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`tab-${id}`}
            aria-selected={tab === id}
            aria-controls={`panel-${id}`}
            tabIndex={tab === id ? 0 : -1}
            className={`tab ${tab === id ? 'active' : ''}`}
            onClick={() => setTab(id)}
          >
            <Icon aria-hidden="true" /> {label}
          </button>
        ))}
      </div>

      {tab === 'opname' ? <PanelOpname /> : <PanelRetur />}
    </>
  )
}