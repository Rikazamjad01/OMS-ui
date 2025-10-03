import { NextResponse } from 'next/server'

export async function middleware(request) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl

  // Supported locales (keep in sync with src/configs/i18n.js)
  const locales = ['en', 'fr', 'ar']

  // Remove locale prefix from the path for routing checks
  const segments = pathname.split('/').filter(Boolean)
  const hasLocalePrefix = segments.length > 0 && locales.includes(segments[0])
  const pathWithoutLocale = hasLocalePrefix ? `/${segments.slice(1).join('/')}` : pathname

  // Auth pages that should remain accessible when not logged in
  const authPaths = new Set(['/login', '/forgot-password', '/reset-password', '/register', '/change-password'])

  const isAuthRoute = authPaths.has(pathWithoutLocale)

  // Allow root always
  if (pathWithoutLocale === '/') {
    return NextResponse.next()
  }

  // If not authenticated
  if (!token) {
    // Allow only auth routes when not logged in
    if (isAuthRoute) {
      return NextResponse.next()
    }
    // Redirect others to login (preserve locale if present)
    const url = request.nextUrl.clone()
    url.pathname = hasLocalePrefix ? `/${segments[0]}/login` : '/login'
    return NextResponse.redirect(url)
  }

  // If authenticated and visiting an auth route, redirect to dashboards/sales
  if (token && isAuthRoute) {
    const url = request.nextUrl.clone()
    const target = '/apps/ecommerce/orders/list'
    url.pathname = hasLocalePrefix ? `/${segments[0]}${target}` : target
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  // Match all paths except for static files, API routes, and assets
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$|.*\\.gif$|.*\\.webp$).*)'
  ]
}
