import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // Jika tidak ada session dan bukan di halaman login, redirect ke login
  if (!session && !req.nextUrl.pathname.startsWith('/login')) {
    const redirectUrl = new URL('/login', req.url)
    return NextResponse.redirect(redirectUrl)
  }

  // Jika ada session, ambil role dari user_profil
  let userRole = 'anggota'
  let userNia = null
  let userRanting = null

  if (session) {
    const { data: profile } = await supabase
      .from('user_profil')
      .select('role, nia, ranting')
      .eq('id', session.user.id)
      .single()
    if (profile) {
      userRole = profile.role
      userNia = profile.nia
      userRanting = profile.ranting
    }
  }

  // Simpan role, nia, ranting di header untuk digunakan di server components
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-user-role', userRole)
  requestHeaders.set('x-user-nia', userNia || '')
  requestHeaders.set('x-user-ranting', userRanting || '')

  response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
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
