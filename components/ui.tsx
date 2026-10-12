'use client'

import { useEffect, useId, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { X } from 'lucide-react'

/** Badge status. Warna tidak pernah jadi satu-satunya penanda — teksnya selalu ada. */
export function Status({ tone, children }: { tone: string; children: ReactNode }) {
  return <span className={`status-pill ${tone}`}><i aria-hidden="true" />{children}</span>
}

type ButtonProps = {
  children: ReactNode
  secondary?: boolean
  onClick?: () => void
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'children' | 'className'>

export function Button({ children, secondary = false, onClick, disabled, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      className={secondary ? 'outline-button' : 'primary-button'}
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  )
}

export function Modal({
  title,
  description,
  onClose,
  children,
}: {
  title: string
  description?: string
  onClose: () => void
  children: ReactNode
}) {
  const dialogRef = useRef<HTMLElement>(null)
  const titleId = useId()

  // Fokus dikembalikan ke elemen yang membuka dialog, supaya alur keyboard
  // pengguna tidak ikut terlempar ke atas halaman.
  const opener = useRef<HTMLElement | null>(null)

  useEffect(() => {
    opener.current = document.activeElement as HTMLElement | null

    const dialog = dialogRef.current
    const focusable = dialog?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    focusable?.focus()

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose()
        return
      }
      if (event.key !== 'Tab' || !dialog) return

      // Focus trap: Tab hanya boleh bergerak di dalam dialog.
      const items = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((item) => item.offsetParent !== null)
      if (items.length === 0) return

      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      opener.current?.focus()
    }
  }, [onClose])

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        ref={dialogRef}
      >
        <div className="modal-header">
          <div>
            <h2 id={titleId}>{title}</h2>
            {description && <p>{description}</p>}
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Tutup popup">
            <X aria-hidden="true" />
          </button>
        </div>
        {children}
      </section>
    </div>
  )
}

export function Field({ label, htmlFor, children }: { label: string; htmlFor?: string; children: ReactNode }) {
  return <div className="field"><label htmlFor={htmlFor}>{label}</label>{children}</div>
}

export function DataTable({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <div className="table-scroll" role="region" aria-label={label} tabIndex={0}>
      <table>{children}</table>
    </div>
  )
}

/**
 * Baris "belum ada data" untuk tabel.
 *
 * `colSpan` wajib sesuai jumlah kolom tabel. Dipakai sebagai children <tbody>
 * supaya struktur tabel tetap valid.
 */
export function EmptyRow({ colSpan, children }: { colSpan: number; children: ReactNode }) {
  return <tr><td className="obat-kosong" colSpan={colSpan}>{children}</td></tr>
}