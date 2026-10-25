'use client'

import { createContext, useContext } from 'react'

export type AlertTone = 'success' | 'error' | 'warning' | 'info'

export type AlertDialogOptions = {
  judul: string
  pesan: string
  tipe: AlertTone
}

export type AlertConfirmOptions = {
  judul: string
  pesan: string
  teksYa: string
  teksTidak: string
  berbahaya?: boolean
}

export type AlertApi = {
  success: (pesan: string) => void
  error: (pesan: string) => void
  warning: (pesan: string) => void
  info: (pesan: string) => void
  dialog: (options: AlertDialogOptions) => void
  confirm: (options: AlertConfirmOptions) => Promise<boolean>
}

export const AlertContext = createContext<AlertApi | null>(null)

export function useAlert(): AlertApi {
  const alert = useContext(AlertContext)
  if (!alert) throw new Error('useAlert harus digunakan di dalam AlertProvider.')
  return alert
}
