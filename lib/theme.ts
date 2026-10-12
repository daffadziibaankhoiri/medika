/**
 * Tema tampilan (light / dark).
 *
 * Dark mode lewat kelas `.dark` pada <html>, dibaca CSS lewat
 * `color-scheme` + `light-dark()` (lihat blok DESIGN TOKEN di globals.css).
 * Penyimpanan hanya di localStorage supaya tidak perlu server.
 */

export const THEME_KEY = 'healti-theme'
export type Theme = 'light' | 'dark'

export const isTheme = (value: unknown): value is Theme =>
  value === 'light' || value === 'dark'

/**
 * Skrip yang harus jalan SEBELUM first paint, disisipkan inline di <head>.
 * Tanpa ini halaman sempat flash dengan tema yang salah.
 * `data-t="dark"` sebagai penanda supaya tidak ikut ter-minify jadi error.
 */
export const THEME_BOOT_SCRIPT = `(function(){try{var k=${JSON.stringify(THEME_KEY)};var s=localStorage.getItem(k);var d=s?s==='dark':matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d);document.documentElement.style.colorScheme=d?'dark':'light';}catch(e){}})();`

/** Tema aktif saat ini. Dipanggil dari client component. */
export function currentTheme(): Theme {
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

/** Terapkan tema ke <html> + simpan pilihan pengguna. */
export function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  document.documentElement.style.colorScheme = theme
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {
    // Mode privat / storage diblokir: tema tetap berlaku di sesi ini saja.
  }
}