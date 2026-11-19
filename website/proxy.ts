import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const VANITY_SUBDOMAINS: Record<string, string> = {
  amorfa: '/amorfa',
  events: '/events',
  vershiny: '/vershiny_top',
}

const REWRITE_SUBDOMAINS = new Set(['app', 'admin', '0leak'])

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone()
  const pathname = url.pathname
  const hostname = request.headers.get('host')?.split(':')[0]
  const baseDomain = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || '')
    .trim()
    .toLowerCase()

  if (!baseDomain) return NextResponse.next()
  if (pathname.startsWith('/_next')) return NextResponse.next()
  if (pathname.startsWith('/api')) return NextResponse.next()
  if (pathname.startsWith('/dev-storage')) return NextResponse.next()
  if (pathname.includes('.')) return NextResponse.next()

  const subdomain =
    hostname && hostname !== baseDomain ? hostname.split('.')[0] : ''

  if (subdomain && subdomain in VANITY_SUBDOMAINS) {
    const target = new URL(request.url)
    target.host = baseDomain
    target.pathname = VANITY_SUBDOMAINS[subdomain]
    target.search = ''
    return NextResponse.redirect(target, 302)
  }

  if (subdomain && REWRITE_SUBDOMAINS.has(subdomain)) {
    const prefix = `/${subdomain}`
    // Already prefixed? (admin.example.com/admin/secret/users)
    // Leave as-is - /admin/secret/users is a valid route.
    // Otherwise prepend (admin.example.com/secret/users → /admin/secret/users).
    if (pathname !== prefix && !pathname.startsWith(`${prefix}/`)) {
      url.pathname = `${prefix}${pathname}`
    }
    return NextResponse.rewrite(url)
  }

  // English lives at /en/*; everything else is the Russian default.
  // Rewrite keeps the /en URL in the address bar while serving the same
  // route tree. The header tells server components/metadata which
  // language to render.
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    const target = new URL(request.url)
    target.pathname = pathname.replace(/^\/en(?=\/|$)/, '') || '/'

    const headers = new Headers(request.headers)
    headers.set('x-locale', 'en')
    return NextResponse.rewrite(target, { request: { headers } })
  }

  const headers = new Headers(request.headers)
  headers.set('x-locale', 'ru')
  return NextResponse.next({ request: { headers } })
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|svg|gif|webp|avif|ico|woff|woff2|ttf|otf)$).*)',
  ],
}
