import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware'

const locales = ['ar', 'en', 'fr']
const defaultLocale = 'ar'

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
})

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // 1. استثناء روابط الـ API تماماً من الـ middleware والتعريب
  if (pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // 2. تشغيل next-intl للمسارات العادية
  let response = intlMiddleware(request)

  // 3. إعداد Supabase
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // تحديد اللغة
  const locale = locales.find(l => pathname.startsWith(`/${l}`)) || defaultLocale
  const pathnameWithoutLocale = pathname.replace(`/${locale}`, '') || '/'

  // حماية المسارات
  const protectedPaths = ['/dashboard', '/chatbot', '/admin', '/vendor']
  const isProtected = protectedPaths.some(p => pathnameWithoutLocale.startsWith(p))

  if (isProtected) {
    if (!user) {
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url))
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role || 'user'

    if (role === 'banned') {
      await supabase.auth.signOut()
      return NextResponse.json({ error: 'Banned' }, { status: 403 })
    }

    if (pathnameWithoutLocale.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url))
    }

    if (pathnameWithoutLocale.startsWith('/vendor') && role !== 'vendor' && role !== 'admin') {
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url))
    }
  }

  if (pathname === '/') {
    return NextResponse.redirect(new URL(`/${defaultLocale}/login`, request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
}
