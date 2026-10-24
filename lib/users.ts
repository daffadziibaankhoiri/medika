/**
 * ============================================================================
 *  DEMO ONLY, ganti dengan database dan autentikasi di server.
 * ============================================================================
 *  Akun pengguna disimpan di localStorage (kunci `healti_users`) sebagai tiruan
 *  penyimpanan pengguna. Password TIDAK pernah disimpan sebagai teks biasa:
 *  yang disimpan ke store hanya hash SHA-256 yang dihitung dengan Web Crypto
 *  API.
 *
 *  Untuk aplikasi sungguhan, ganti seluruh isi file ini dengan:
 *    - penyimpanan pengguna di database (server),
 *    - hashing password Argon2 atau bcrypt di sisi server dengan salt per
 *      pengguna (SHA-256 tanpa salt di sini hanya untuk demo),
 *    - autentikasi dan pengelolaan sesi yang ditangani server.
 * ============================================================================
 */

export type Role = 'Owner' | 'Apoteker' | 'Staff Administrasi'

export type AccountStatus = 'aktif' | 'nonaktif' | 'menunggu'

export type StoredUser = {
  id: string
  name: string
  email: string
  passwordHash: string
  role: Role
  status: AccountStatus
  /** ISO timestamp aktivitas terakhir; null bila belum pernah login. */
  lastActiveAt: string | null
  /** ISO timestamp waktu akun dibuat. */
  createdAt: string
}

/** Kunci localStorage penyimpan data akun. */
export const USER_STORE_KEY = 'healti_users'

/** Panjang minimum password. */
export const MIN_PASSWORD_LENGTH = 8

/** Role yang boleh dipilih Owner saat membuat atau menyetujui akun. */
export const ASSIGNABLE_ROLES: Role[] = ['Apoteker', 'Staff Administrasi']

/** Role default untuk pendaftaran mandiri. */
export const DEFAULT_NEW_ACCOUNT_ROLE: Role = 'Staff Administrasi'

type SeedUser = {
  id: string
  name: string
  email: string
  /** DEMO ONLY: plaintext hanya dipakai untuk membuat hash dan menampilkan
   *  kredensial demo di halaman login. Tidak pernah disimpan ke store. */
  password: string
  role: Role
  status: AccountStatus
  lastActive: (now: number) => string | null
  createdDaysAgo: number
}

/**
 * DEMO ONLY, ganti dengan database dan autentikasi di server.
 * Akun contoh: 3 akun lama yang bisa login, 1 akun menunggu persetujuan, dan
 * 1 akun nonaktif.
 */
const SEED_USERS: SeedUser[] = [
  {
    id: 'usr-owner-001', name: 'Budi Santoso', email: 'owner@healti.id', password: 'Owner123!',
    role: 'Owner', status: 'aktif',
    lastActive: (now) => new Date(now - 2 * 60_000).toISOString(),
    createdDaysAgo: 210,
  },
  {
    id: 'usr-apoteker-002', name: 'Siti Rahayu', email: 'apoteker@healti.id', password: 'Apoteker123!',
    role: 'Apoteker', status: 'aktif',
    lastActive: (now) => new Date(now - 12 * 60_000).toISOString(),
    createdDaysAgo: 180,
  },
  {
    id: 'usr-staff-003', name: 'Andi Wijaya', email: 'staff@healti.id', password: 'Staff123!',
    role: 'Staff Administrasi', status: 'aktif',
    lastActive: (now) => {
      const d = new Date(now - 24 * 60 * 60_000)
      d.setHours(16, 40, 0, 0)
      return d.toISOString()
    },
    createdDaysAgo: 150,
  },
  {
    id: 'usr-menunggu-004', name: 'Dewi Lestari', email: 'dewi@healti.id', password: 'Staff123!',
    role: 'Staff Administrasi', status: 'menunggu',
    lastActive: () => null,
    createdDaysAgo: 3,
  },
  {
    id: 'usr-nonaktif-005', name: 'Rizky Pratama', email: 'rizky@healti.id', password: 'Staff123!',
    role: 'Apoteker', status: 'nonaktif',
    lastActive: (now) => new Date(now - 3 * 24 * 60 * 60_000).toISOString(),
    createdDaysAgo: 120,
  },
]

/** Kredensial demo untuk ditampilkan di halaman login (DEMO ONLY). */
export type DemoAccountHint = {
  id: string
  name: string
  email: string
  password: string
  role: Role
  status: AccountStatus
}

export const DEMO_ACCOUNT_HINTS: DemoAccountHint[] = SEED_USERS.map((user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  password: user.password,
  role: user.role,
  status: user.status,
}))

/**
 * Hash password dengan SHA-256 lewat Web Crypto API.
 *
 * DEMO ONLY: produksi memakai Argon2 atau bcrypt di server dengan salt per
 * pengguna. SHA-256 tanpa salt di sini hanya supaya password tidak tersimpan
 * sebagai teks biasa di localStorage.
 */
export async function hashPassword(password: string): Promise<string> {
  const cryptoRef = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined
  if (!cryptoRef?.subtle) {
    throw new Error('Web Crypto API tidak tersedia. Jalankan aplikasi melalui localhost atau HTTPS.')
  }
  const digest = await cryptoRef.subtle.digest('SHA-256', new TextEncoder().encode(password))
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function readStore(): StoredUser[] | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(USER_STORE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredUser[]
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

function writeStore(users: StoredUser[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(USER_STORE_KEY, JSON.stringify(users))
  } catch {
    // localStorage penuh atau diblokir: data hanya bertahan di memori.
  }
}

async function buildSeed(): Promise<StoredUser[]> {
  const now = Date.now()
  return Promise.all(
    SEED_USERS.map(async (seed) => ({
      id: seed.id,
      name: seed.name,
      email: normalizeEmail(seed.email),
      passwordHash: await hashPassword(seed.password),
      role: seed.role,
      status: seed.status,
      lastActiveAt: seed.lastActive(now),
      createdAt: new Date(now - seed.createdDaysAgo * 24 * 60 * 60_000).toISOString(),
    })),
  )
}

let seedPromise: Promise<StoredUser[]> | null = null

/** Pastikan store terisi; seed hanya dijalankan sekali. */
async function ensureStore(): Promise<StoredUser[]> {
  const existing = readStore()
  if (existing) return existing
  if (!seedPromise) {
    seedPromise = buildSeed().then((seeded) => {
      writeStore(seeded)
      return seeded
    })
  }
  return seedPromise
}

/** Semua akun yang tersimpan. */
export async function listUsers(): Promise<StoredUser[]> {
  return ensureStore()
}

/** Cari akun berdasarkan email (tidakcase). */
export async function findUserByEmail(email: string): Promise<StoredUser | null> {
  const users = await listUsers()
  const target = normalizeEmail(email)
  return users.find((user) => user.email === target) ?? null
}

/** Cari akun berdasarkan id. */
export async function findUserById(id: string): Promise<StoredUser | null> {
  const users = await listUsers()
  return users.find((user) => user.id === id) ?? null
}

/** Cek apakah password cocok dengan hash akun. */
export async function verifyPassword(user: StoredUser, password: string): Promise<boolean> {
  const hash = await hashPassword(password)
  return hash === user.passwordHash
}

function newUserId(): string {
  const cryptoRef = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined
  if (cryptoRef?.randomUUID) return `usr-${cryptoRef.randomUUID()}`
  return `usr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export type CreateUserResult =
  | { ok: true; user: StoredUser }
  | { ok: false; message: string }

/** Buat akun baru. Email harus unik, password minimal MIN_PASSWORD_LENGTH. */
export async function createUser(input: {
  name: string
  email: string
  password: string
  role: Role
  status: AccountStatus
}): Promise<CreateUserResult> {
  const users = await listUsers()
  const email = normalizeEmail(input.email)

  if (!input.name.trim()) return { ok: false, message: 'Nama wajib diisi.' }
  if (!email) return { ok: false, message: 'Email wajib diisi.' }
  if (users.some((user) => user.email === email)) {
    return { ok: false, message: 'Email sudah digunakan oleh akun lain.' }
  }
  if (input.password.length < MIN_PASSWORD_LENGTH) {
    return { ok: false, message: `Password minimal ${MIN_PASSWORD_LENGTH} karakter.` }
  }

  const user: StoredUser = {
    id: newUserId(),
    name: input.name.trim(),
    email,
    passwordHash: await hashPassword(input.password),
    role: input.role,
    status: input.status,
    lastActiveAt: null,
    createdAt: new Date().toISOString(),
  }

  writeStore([...users, user])
  return { ok: true, user }
}

/** Ubah data akun (peran, status, nama, email). */
export async function updateUser(
  id: string,
  patch: Partial<Pick<StoredUser, 'name' | 'email' | 'role' | 'status'>>,
): Promise<StoredUser | null> {
  const users = await listUsers()
  const index = users.findIndex((user) => user.id === id)
  if (index === -1) return null

  const current = users[index]
  const email = patch.email ? normalizeEmail(patch.email) : current.email
  if (email !== current.email && users.some((user) => user.email === email)) {
    return null
  }

  const updated: StoredUser = {
    ...current,
    ...patch,
    email,
    name: patch.name ? patch.name.trim() : current.name,
  }
  const next = [...users]
  next[index] = updated
  writeStore(next)
  return updated
}

/** Hapus akun dari store. */
export async function removeUser(id: string): Promise<void> {
  const users = await listUsers()
  writeStore(users.filter((user) => user.id !== id))
}

/** Catat aktivitas terakhir pengguna (login, logout, atau pemakaian berkala). */
export async function touchUserActivity(id: string): Promise<void> {
  const users = await listUsers()
  const index = users.findIndex((user) => user.id === id)
  if (index === -1) return
  const next = [...users]
  next[index] = { ...users[index], lastActiveAt: new Date().toISOString() }
  writeStore(next)
}
