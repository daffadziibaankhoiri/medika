import { NextResponse, type NextRequest } from 'next/server'
import { SESSION_COOKIE } from './lib/auth'

/**
 * Route guard untuk sesi tiruan.
 *
 * DEMO ONLY: cookie sesi di sini hanya dicek keberadaan nilainya, bukan
 * keasliannya, karena cookie dibuat di sisi client tanpa tanda tangan.
 * Ganti seluruhnya dengan verifikasi sesi sungguhan saat produksi.
 */

const PUBLIC_PATHS = new Set(['/', '/login', '/register'])

function hasSession(request: NextRequest): boolean {
  const cookie = request.cookies.get(SESSION_COOKIE)?.value
  return typeof cookie === 'string' && cookie.trim().length > 0
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const isPublic = PUBLIC_PATHS.has(pathname)

  // Sudah punya sesi tapi membuka halaman auth -> langsung ke dashboard.
  if ((pathname === '/login' || pathname === '/register') && hasSession(request)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Rute publik: biarkan lewat.
  if (isPublic) return NextResponse.next()

  // Selain itu wajib punya sesi, kalau tidak arahkan ke /login.
  if (!hasSession(request)) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.search = search
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  // Semua path kecuali aset build Next.js dan file statis.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$).*)'],
}