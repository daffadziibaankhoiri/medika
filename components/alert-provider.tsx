'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type ReactNode,
} from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  XCircle,
} from 'lucide-react'
import {
  AlertContext,
  type AlertApi,
  type AlertConfirmOptions,
  type AlertDialogOptions,
  type AlertTone,
} from '@/lib/use-alert'

type ToastItem = {
  id: string
  kind: 'toast'
  tone: AlertTone
  message: string
}

type DialogItem = {
  id: string
  kind: 'dialog'
  tone: AlertTone
  title: string
  message: string
  opener: HTMLElement | null
}

type ConfirmItem = {
  id: string
  kind: 'confirm'
  title: string
  message: string
  yesLabel: string
  noLabel: string
  dangerous: boolean
  opener: HTMLElement | null
}

type QueueItem = ToastItem | DialogItem | ConfirmItem

const TONE_LABELS: Record<AlertTone, string> = {
  success: 'Berhasil',
  error: 'Kesalahan',
  warning: 'Peringatan',
  info: 'Informasi',
}

function ToneIcon({ tone }: { tone: AlertTone }) {
  if (tone === 'success') return <CheckCircle2 aria-hidden="true" />
  if (tone === 'error') return <XCircle aria-hidden="true" />
  if (tone === 'warning') return <AlertTriangle aria-hidden="true" />
  return <Info aria-hidden="true" />
}

function AlertToast({
  item,
  onClose,
}: {
  item: ToastItem
  onClose: (id: string) => void
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const remainingRef = useRef(4000)
  const startedAtRef = useRef(0)
  const hoveredRef = useRef(false)
  const focusedRef = useRef(false)

  const pause = useCallback(() => {
    if (!timerRef.current) return
    clearTimeout(timerRef.current)
    timerRef.current = null
    remainingRef.current = Math.max(0, remainingRef.current - (Date.now() - startedAtRef.current))
  }, [])

  const resume = useCallback(() => {
    if (timerRef.current || hoveredRef.current || focusedRef.current) return
    startedAtRef.current = Date.now()
    timerRef.current = setTimeout(() => onClose(item.id), remainingRef.current)
  }, [item.id, onClose])

  useEffect(() => {
    startedAtRef.current = Date.now()
    timerRef.current = setTimeout(() => onClose(item.id), remainingRef.current)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [item.id, onClose])

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    const tujuan = event.relatedTarget
    if (!tujuan || !event.currentTarget.contains(tujuan)) {
      focusedRef.current = false
      resume()
    }
  }

  return (
    <div
      className={`alert-toast alert-toast-${item.tone}`}
      onMouseEnter={pause}
      onMouseLeave={() => {
        hoveredRef.current = false
        resume()
      }}
      onFocusCapture={() => {
        focusedRef.current = true
        pause()
      }}
      onBlurCapture={handleBlur}
    >
      <span className="alert-toast-icon"><ToneIcon tone={item.tone} /></span>
      <div className="alert-toast-copy">
        <strong>{TONE_LABELS[item.tone]}</strong>
        <span>{item.message}</span>
      </div>
      <button
        type="button"
        className="alert-toast-close"
        onClick={() => onClose(item.id)}
        aria-label={`Tutup notifikasi ${TONE_LABELS[item.tone]}`}
      >
        <X aria-hidden="true" />
      </button>
    </div>
  )
}

function AlertModal({
  item,
  onResolve,
}: {
  item: DialogItem | ConfirmItem
  onResolve: (id: string, value: boolean) => void
}) {
  const dialogRef = useRef<HTMLElement>(null)
  const safeButtonRef = useRef<HTMLButtonElement>(null)
  const titleId = `alert-title-${item.id}`
  const descriptionId = `alert-description-${item.id}`
  const tone: AlertTone = item.kind === 'confirm'
    ? item.dangerous ? 'error' : 'warning'
    : item.tone

  useEffect(() => {
    safeButtonRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        onResolve(item.id, item.kind === 'confirm' ? false : true)
        return
      }
      if (event.key !== 'Tab' || !dialogRef.current) return

      const items = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.offsetParent !== null)
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

    document.addEventListener('keydown', handleKeyDown, true)
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true)
      item.opener?.focus()
    }
  }, [item.id, item.kind, item.opener, onResolve])

  return (
    <div className="alert-modal-backdrop" role="presentation">
      <section
        className={`alert-modal alert-modal-${tone}`}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        ref={dialogRef}
      >
        <div className="alert-modal-heading">
          <span className="alert-modal-icon"><ToneIcon tone={tone} /></span>
          <div>
            <span className="alert-modal-kind">{TONE_LABELS[tone]}</span>
            <h2 id={titleId}>{TONE_LABELS[tone]}: {item.title}</h2>
          </div>
        </div>
        <p id={descriptionId}>{item.message}</p>
        <div className="alert-modal-actions">
          {item.kind === 'confirm' && (
            <button
              ref={safeButtonRef}
              type="button"
              className="outline-button"
              onClick={() => onResolve(item.id, false)}
            >
              {item.noLabel}
            </button>
          )}
          {item.kind === 'dialog' && (
            <button
              ref={safeButtonRef}
              type="button"
              className="primary-button"
              onClick={() => onResolve(item.id, true)}
            >
              Mengerti
            </button>
          )}
          {item.kind === 'confirm' && (
            <button
              type="button"
              className={item.dangerous ? 'alert-danger-button' : 'primary-button'}
              onClick={() => onResolve(item.id, true)}
            >
              {item.yesLabel}
            </button>
          )}
        </div>
      </section>
    </div>
  )
}

export function AlertProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<QueueItem[]>([])
  const counterRef = useRef(0)
  const resolversRef = useRef(new Map<string, (value: boolean) => void>())

  const nextId = useCallback(() => {
    counterRef.current += 1
    return `alert-${Date.now()}-${counterRef.current}`
  }, [])

  const enqueueToast = useCallback((tone: AlertTone, message: string) => {
    setQueue((current) => [...current, { id: nextId(), kind: 'toast', tone, message }])
  }, [nextId])

  const enqueueDialog = useCallback((options: AlertDialogOptions) => {
    setQueue((current) => [
      ...current,
      {
        id: nextId(),
        kind: 'dialog',
        tone: options.tipe,
        title: options.judul,
        message: options.pesan,
        opener: typeof document === 'undefined' ? null : document.activeElement as HTMLElement | null,
      },
    ])
  }, [nextId])

  const confirm = useCallback((options: AlertConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      const id = nextId()
      resolversRef.current.set(id, resolve)
      setQueue((current) => [
        ...current,
        {
          id,
          kind: 'confirm',
          title: options.judul,
          message: options.pesan,
          yesLabel: options.teksYa,
          noLabel: options.teksTidak,
          dangerous: options.berbahaya ?? false,
          opener: typeof document === 'undefined' ? null : document.activeElement as HTMLElement | null,
        },
      ])
    })
  }, [nextId])

  const removeItem = useCallback((id: string, value: boolean) => {
    const resolver = resolversRef.current.get(id)
    if (resolver) {
      resolver(value)
      resolversRef.current.delete(id)
    }
    setQueue((current) => current.filter((item) => item.id !== id))
  }, [])

  const api = useMemo<AlertApi>(() => ({
    success: (message) => enqueueToast('success', message),
    error: (message) => enqueueToast('error', message),
    warning: (message) => enqueueToast('warning', message),
    info: (message) => enqueueToast('info', message),
    dialog: enqueueDialog,
    confirm,
  }), [confirm, enqueueDialog, enqueueToast])

  const active = queue[0]
  const closeToast = useCallback((id: string) => removeItem(id, true), [removeItem])

  return (
    <AlertContext.Provider value={api}>
      {children}
      <div className="alert-live-region" aria-live="polite" aria-atomic="true">
        {active?.kind === 'toast' && (active.tone === 'success' || active.tone === 'info') && (
          <AlertToast item={active} onClose={closeToast} />
        )}
      </div>
      <div className="alert-live-region" aria-live="assertive" aria-atomic="true">
        {active?.kind === 'toast' && (active.tone === 'error' || active.tone === 'warning') && (
          <AlertToast item={active} onClose={closeToast} />
        )}
      </div>
      {active && active.kind !== 'toast' && (
        <AlertModal item={active} onResolve={removeItem} />
      )}
    </AlertContext.Provider>
  )
}
