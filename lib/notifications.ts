/**
 * Utilitas notifikasi yang dipakai bersama antar halaman.
 *
 * Berisi penanda popup dashboard dan event untuk membuka dropdown topbar,
 * supaya nama kuncinya tidak ditulis ulang di beberapa tempat.
 */

/** Kunci sessionStorage: popup notifikasi dashboard sudah pernah ditampilkan. */
export const DASHBOARD_POPUP_SHOWN_KEY = 'healti_dashboard_popup_shown'

/** Event browser untuk membuka dropdown notifikasi di topbar. */
export const OPEN_NOTIFICATIONS_EVENT = 'healti:open-notifications'

/**
 * Hapus penanda popup notifikasi dashboard.
 *
 * Dipanggil saat login berhasil dan saat logout, supaya popup muncul lagi
 * pada sesi login berikutnya.
 */
export function clearDashboardPopupShownFlag(): void {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.removeItem(DASHBOARD_POPUP_SHOWN_KEY)
  } catch {
    // sessionStorage bisa diblokir pengaturan browser; abaikan saja.
  }
}
