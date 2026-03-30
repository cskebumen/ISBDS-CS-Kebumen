import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(req: NextRequest) {
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

//  if (!session && !req.nextUrl.pathname.startsWith('/login')) {
//    const redirectUrl = new URL('/login', req.url)
//    return NextResponse.redirect(redirectUrl)
//  }

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

  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-user-role', userRole)
  requestHeaders.set('x-user-nia', userNia || '')
  requestHeaders.set('x-user-ranting', userRanting || '')

  response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  const pathname = req.nextUrl.pathname

  if (pathname.startsWith('/kelola-user') && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  if (pathname.startsWith('/keuangan') && !['admin', 'bendahara', 'ketua cabang'].includes(userRole)) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  if (pathname.startsWith('/surat') && !['admin', 'sekretaris', 'ketua cabang', 'ketua ranting'].includes(userRole)) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
