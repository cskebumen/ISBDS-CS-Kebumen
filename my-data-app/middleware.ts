import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session jika ada
  const { data: { session } } = await supabase.auth.getSession()

  // Jika tidak ada session, redirect ke login (kecuali halaman login)
  if (!session && !req.nextUrl.pathname.startsWith('/login')) {
    const redirectUrl = new URL('/login', req.url)
    return NextResponse.redirect(redirectUrl)
  }

  // Ambil role dan nia dari user_profil
  let userRole = 'anggota'
  let userNia = null
  if (session) {
    const { data: userData } = await supabase
      .from('user_profil')
      .select('role, nia')
      .eq('id', session.user.id)
      .single()
    if (userData) {
      userRole = userData.role
      userNia = userData.nia
    }
  }

  // Simpan role dan nia di header untuk digunakan di komponen (opsional)
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-user-role', userRole)
  requestHeaders.set('x-user-nia', userNia || '')

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  })

  // Proteksi rute berdasarkan role
  const pathname = req.nextUrl.pathname

  // Halaman kelola user hanya untuk admin
  if (pathname.startsWith('/kelola-user') && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Rute keuangan hanya untuk admin, bendahara, ketua cabang
  if (pathname.startsWith('/keuangan') && !['admin', 'bendahara', 'ketua cabang'].includes(userRole)) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Rute surat hanya untuk admin, sekretaris, ketua cabang, ketua ranting
  if (pathname.startsWith('/surat') && !['admin', 'sekretaris', 'ketua cabang', 'ketua ranting'].includes(userRole)) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
