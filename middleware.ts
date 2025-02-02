import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  try {
    console.log('Middleware - Processing request:', request.nextUrl.pathname)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error('Middleware - Session error:', sessionError)
      return response
    }

    console.log('Middleware - Session status:', session ? 'Authenticated' : 'Not authenticated')

    // 如果用戶未登入且嘗試訪問受保護的路由
    if (!session && (
      request.nextUrl.pathname.startsWith('/create-playlist') ||
      request.nextUrl.pathname.startsWith('/my-playlists') ||
      request.nextUrl.pathname.startsWith('/playlists') && (
        request.nextUrl.pathname.endsWith('/edit') ||
        request.method !== 'GET'
      )
    )) {
      console.log('Middleware - Redirecting to login')
      const redirectUrl = new URL('/login', request.url)
      return NextResponse.redirect(redirectUrl)
    }

    // 如果用戶已登入且嘗試訪問登入頁面
    if (session && request.nextUrl.pathname === '/login') {
      console.log('Middleware - Redirecting to home')
      const redirectUrl = new URL('/', request.url)
      return NextResponse.redirect(redirectUrl)
    }

    console.log('Middleware - Request processed successfully')
    return response
  } catch (error) {
    console.error('Middleware - Unexpected error:', error)
    return response
  }
}

export const config = {
  matcher: [
    '/create-playlist',
    '/my-playlists',
    '/playlists/:path*/edit',
    '/login',
  ],
}
