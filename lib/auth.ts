/**
 * ============================================================================
 *  DEMO ONLY, ganti dengan autentikasi sungguhan.
 * ============================================================================
 *  Seluruh akun di bawah ini di-hardcode di dalam source code dan password
 *  disimpan dalam bentuk plaintext. Ini HANYA untuk keperluan demonstrasi
 *  tugas, TIDAK aman, dan TIDAK boleh dipakai di produksi.
 *
 *  Untuk aplikasi sungguhan, ganti seluruh isi file ini dengan:
 *    - hashing password (bcrypt / argon2) di sisi server,
 *    - penyimpanan pengguna di database,
 *    - sesi bertanda tangan (JWT / session cookie httpOnly),
 *    - dan endpoint autentikasi yang benar-benar memverifikasi kredensial.
 */

export type Role = 'Owner' | 'Apoteker' | 'Staff Administrasi'

export type DemoAccount = {
  email: string
  password: string
  name: string
  role: Role
}

/**
 * DEMO ONLY, ganti dengan autentikasi sungguhan.
 * Akun ini di-hardcode untuk keperluan demonstrasi tugas.
 */
export const DEMO_ACCOUNTS: readonly DemoAccount[] = [
  { email: 'owner@healti.id', password: 'Owner123!', name: 'Budi Santoso', role: 'Owner' },
  { email: 'apoteker@healti.id', password: 'Apoteker123!', name: 'Siti Rahayu', role: 'Apoteker' },
  { email: 'staff@healti.id', password: 'Staff123!', name: 'Andi Wijaya', role: 'Staff Administrasi' },
]

/** Role yang otomatis diberikan kepada setiap akun baru yang mendaftar. */
export const DEFAULT_NEW_ACCOUNT_ROLE: Role = 'Staff Administrasi'

export const MIN_PASSWORD_LENGTH = 8

/** Nama cookie yang menyimpan sesi tiruan. */
export const SESSION_COOKIE = 'healti_session'

/** Umur sesi tiruan: 12 jam. */
const SESSION_MAX_AGE = 60 * 60 * 12

export type Session = {
  name: string
  email: string
  role: Role
}

/**
 * Cocokkan kredensial dengan akun demo.
 * Mengembalikan objek Session bila cocok, atau `null` bila tidak.
 */
export function authenticate(email: string, password: string): Session | null {
  const normalizedEmail = email.trim().toLowerCase()
  const match = DEMO_ACCOUNTS.find((account) => account.email === normalizedEmail)
  if (!match || match.password !== password) return null
  return { name: match.name, email: match.email, role: match.role }
}

/** Validasi format email yang wajar. */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())
}

function encodeSession(session: Session): string {
  const json = JSON.stringify(session)
  // encodeURIComponent/base64 agar aman disimpan sebagai nilai cookie.
  const base64 =
    typeof window === 'undefined'
      ? Buffer.from(json, 'utf8').toString('base64')
      : window.btoa(unescape(encodeURIComponent(json)))
  return encodeURIComponent(base64)
}

function decodeSession(value: string): Session | null {
  try {
    const base64 = decodeURIComponent(value)
    const json =
      typeof window === 'undefined'
        ? Buffer.from(base64, 'base64').toString('utf8')
        : decodeURIComponent(window.atob(base64))
    const parsed = JSON.parse(json) as Session
    if (!parsed || typeof parsed.name !== 'string' || typeof parsed.email !== 'string' || typeof parsed.role !== 'string') {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

/** Baca sesi tiruan dari cookie. Aman dipanggil di server maupun client. */
export function readSession(): Session | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.split('; ').find((row) => row.startsWith(`${SESSION_COOKIE}=`))
  if (!match) return null
  const value = match.slice(SESSION_COOKIE.length + 1)
  if (!value) return null
  return decodeSession(value)
}

/** Tulis sesi tiruan ke cookie. Cookie sengaja TIDAK httpOnly agar bisa dibaca UI. */
export function writeSession(session: Session): void {
  if (typeof document === 'undefined') return
  document.cookie = `${SESSION_COOKIE}=${encodeSession(session)}; path=/; max-age=${SESSION_MAX_AGE}; SameSite=Lax`
}

/** Hapus sesi tiruan dari cookie. */
export function clearSession(): void {
  if (typeof document === 'undefined') return
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; SameSite=Lax`
}

/** Inisial untuk avatar, maksimal 2 huruf. */
export function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}