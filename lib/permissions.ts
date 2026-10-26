import type { Role } from './auth'

/**
 * Hak akses per role.
 *
 * Aturan dari spesifikasi:
 *  - Owner                 : melihat semua menu.
 *  - Apoteker              : tidak melihat "Laporan" dan kolom harga pokok.
 *  - Staff Administrasi    : hanya melihat Obat, Kasir, Supplier, dan Stock Opname.
 */

export type Permission =
  | 'dashboard'
  | 'obat'
  | 'kategori'
  | 'kasir'
  | 'supplier'
  | 'stock-opname'
  | 'laporan'
  | 'pengaturan'
  | 'akun'
  | 'notifikasi'

const ALL_PERMISSIONS: Permission[] = [
  'dashboard', 'obat', 'kategori', 'kasir', 'supplier', 'stock-opname', 'laporan', 'pengaturan', 'akun', 'notifikasi',
]

/**
 * Menu yang boleh diakses tiap role.
 * Apoteker tidak diberi 'laporan'. Staff hanya empat menu yang disebutkan.
 * 'akun' (Kelola Akun) hanya untuk Owner.
 */
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  Owner: ALL_PERMISSIONS,
  Apoteker: ALL_PERMISSIONS,
  'Staff Administrasi': ['obat', 'kasir', 'supplier', 'stock-opname', 'notifikasi'],
}

/** Apakah role punya akses ke sebuah menu/rute? */
export function canAccess(role: Role | null | undefined, permission: Permission): boolean {
  if (!role) return false
  return ROLE_PERMISSIONS[role].includes(permission)
}

/**
 * Harga pokok (harga modal / HPP) hanya boleh dilihat Owner.
 * Apoteker secara definisi tidak melihat kolom ini.
 */
export function canViewCostPrice(role: Role | null | undefined): boolean {
  return role === 'Owner'
}

/**
 * Ubah pathname URL menjadi permission.
 * Mengembalikan null bila path bukan rute aplikasi yang dikenali.
 */
export function permissionFromPath(pathname: string): Permission | null {
  const path = pathname.replace(/\/+$/, '') || '/'
  const map: Record<string, Permission> = {
    '/': 'dashboard',
    '/dashboard': 'dashboard',
    '/obat': 'obat',
    '/kategori': 'kategori',
    '/kasir': 'kasir',
    '/supplier': 'supplier',
    '/stock-opname': 'stock-opname',
    '/laporan': 'laporan',
    '/pengaturan': 'pengaturan',
    '/akun': 'akun',
    '/notifikasi': 'notifikasi',
  }
  return map[path] ?? null
}

/** Halaman tujuan setelah login, sesuai menu pertama yang diizinkan role. */
export function defaultPathForRole(role: Role): string {
  const landing: Record<Permission, string> = {
    dashboard: '/dashboard',
    obat: '/obat',
    kategori: '/kategori',
    kasir: '/kasir',
    supplier: '/supplier',
    'stock-opname': '/stock-opname',
    laporan: '/laporan',
    pengaturan: '/pengaturan',
    akun: '/akun',
    notifikasi: '/notifikasi',
  }
  const first = ROLE_PERMISSIONS[role][0]
  return landing[first]
}