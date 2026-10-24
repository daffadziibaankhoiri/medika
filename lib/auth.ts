/**
 * ============================================================================
 *  DEMO ONLY, ganti dengan autentikasi sungguhan.
 * ============================================================================
 *  Sesi tiruan disimpan di cookie `healti_session` yang sengaja TIDAK httpOnly
 *  agar bisa dibaca UI. Data akunnya ada di store tiruan localStorage
 *  (lihat lib/users.ts).
 *
 *  Untuk aplikasi sungguhan, ganti seluruh isi file ini dengan:
 *    - penyimpanan pengguna di database,
 *    - hashing password (bcrypt / argon2) di sisi server,
 *    - sesi bertanda tangan (JWT / session cookie httpOnly),
 *    - dan endpoint autentikasi yang benar-benar memverifikasi kredensial.
 */

import { clearDashboardPopupShownFlag } from '@/lib/notifications'
import {
  findUserByEmail,
  findUserById,
  touchUserActivity,
  verifyPassword,
  type AccountStatus,
  type Role,
} from '@/lib/users'

export type { Role } from '@/lib/users'
export { DEFAULT_NEW_ACCOUNT_ROLE, MIN_PASSWORD_LENGTH } from '@/lib/users'

/** Nama cookie yang menyimpan sesi tiruan. */
export const SESSION_COOKIE = 'healti_session'

/** Kunci sessionStorage untuk pesan yang perlu ditampilkan di halaman login. */
export const LOGIN_NOTICE_KEY = 'healti_login_notice'

/** Umur sesi tiruan: 12 jam. */
const SESSION_MAX_AGE = 60 * 60 * 12

export type Session = {
  id: string
  name: string
  email: string
  role: Role
}

/** Alasan login ditolak, dipakai halaman login untuk menampilkan pesan. */
export type LoginRejection = 'invalid' | 'nonaktif' | 'menunggu'

export type LoginResult =
  | { ok: true; session: Session }
  | { ok: false; reason: LoginRejection; message: string }

/** Pesan penolakan login sesuai status akun. */
export const LOGIN_REJECTION_MESSAGES: Record<LoginRejection, string> = {
  invalid: 'Email atau password salah. Silakan periksa kembali data Anda.',
  nonaktif: 'Akun Anda dinonaktifkan. Hubungi Owner.',
  menunggu: 'Akun Anda belum disetujui Owner.',
}

/**
 * Cocokkan kredensial dengan akun di store.
 *
 * Akun berstatus "nonaktif" dan "menunggu" tidak boleh masuk; masing-masing
 * punya pesan penolakan sendiri.
 */
export async function authenticate(email: string, password: string): Promise<LoginResult> {
  const user = await findUserByEmail(email)
  if (!user) return { ok: false, reason: 'invalid', message: LOGIN_REJECTION_MESSAGES.invalid }
  if (!(await verifyPassword(user, password))) {
    return { ok: false, reason: 'invalid', message: LOGIN_REJECTION_MESSAGES.invalid }
  }
  if (user.status === 'nonaktif') {
    return { ok: false, reason: 'nonaktif', message: LOGIN_REJECTION_MESSAGES.nonaktif }
  }
  if (user.status === 'menunggu') {
    return { ok: false, reason: 'menunggu', message: LOGIN_REJECTION_MESSAGES.menunggu }
  }
  return { ok: true, session: { id: user.id, name: user.name, email: user.email, role: user.role } }
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
        ? Buffer.from(base64, 'utf8').toString('utf8')
        : decodeURIComponent(window.atob(base64))
    const parsed = JSON.parse(json) as Partial<Session>
    if (!parsed || typeof parsed.name !== 'string' || typeof parsed.email !== 'string' || typeof parsed.role !== 'string') {
      return null
    }
    return {
      id: typeof parsed.id === 'string' ? parsed.id : '',
      name: parsed.name,
      email: parsed.email,
      role: parsed.role,
    }
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

/**
 * Periksa apakah sesi yang sedang dipakai masih sah.
 *
 * Dipanggil saat halaman dimuat dan setiap kali pengguna berpindah halaman,
 * supaya akun yang dinonaktifkan atau ditolak Owner langsung lose session.
 */
export type SessionCheck =
  | { state: 'valid'; session: Session }
  | { state: 'invalid' }
  | { state: 'rejected'; status: Exclude<AccountStatus, 'aktif'>; message: string }

export async function checkSession(): Promise<SessionCheck> {
  const session = readSession()
  if (!session) return { state: 'invalid' }

  const user = session.id ? await findUserById(session.id) : null
  if (!user) return { state: 'invalid' }
  if (user.status !== 'aktif') {
    return {
      state: 'rejected',
      status: user.status,
      message: LOGIN_REJECTION_MESSAGES[user.status === 'nonaktif' ? 'nonaktif' : 'menunggu'],
    }
  }
  return { state: 'valid', session: { id: user.id, name: user.name, email: user.email, role: user.role } }
}

/** Tulis sesi tiruan ke cookie. Cookie sengaja TIDAK httpOnly agar bisa dibaca UI. */
export async function writeSession(session: Session): Promise<void> {
  if (typeof document === 'undefined') return
  document.cookie = `${SESSION_COOKIE}=${encodeSession(session)}; path=/; max-age=${SESSION_MAX_AGE}; SameSite=Lax`
  // Sesi baru: popup notifikasi dashboard boleh tampil lagi.
  clearDashboardPopupShownFlag()
  // Aktivitas login dicatat di store akun.
  await touchUserActivity(session.id)
}

/** Hapus sesi tiruan dari cookie. */
export async function clearSession(): Promise<void> {
  const session = readSession()
  if (session?.id) {
    // Waktu logout juga dihitung sebagai aktivitas terakhir.
    await touchUserActivity(session.id)
  }
  if (typeof document === 'undefined') return
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; SameSite=Lax`
  // Logout: sesi berikutnya harus menampilkan popup notifikasi dari awal.
  clearDashboardPopupShownFlag()
}

/** Simpan pesan untuk ditampilkan di halaman login berikutnya. */
export function setLoginNotice(message: string): void {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(LOGIN_NOTICE_KEY, message)
  } catch {
    // sessionStorage diblokir browser: pesan tidak ditampilkan.
  }
}

/** Ambil dan hapus pesan login yang tersimpan. */
export function readLoginNotice(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const message = window.sessionStorage.getItem(LOGIN_NOTICE_KEY)
    window.sessionStorage.removeItem(LOGIN_NOTICE_KEY)
    return message
  } catch {
    return null
  }
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
