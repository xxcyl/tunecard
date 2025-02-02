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
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error('Middleware - Session error:', sessionError)
      return response
    }

    // 如果用戶未登入且嘗試訪問受保護的路由
    if (!session && (
      request.nextUrl.pathname.startsWith('/create-playlist') ||
      request.nextUrl.pathname.startsWith('/my-playlists') ||
      request.nextUrl.pathname.startsWith('/playlists') && request.nextUrl.pathname.endsWith('/edit')
    )) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    return response
  } catch (error) {
    console.error('Middleware - Error:', error)
    return response
  }
}

export const config = {
  matcher: [
    '/create-playlist',
    '/my-playlists',
    '/playlists/:path*/edit',
  ],
}
