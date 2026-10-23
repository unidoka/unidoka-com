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
  const hostname = request.headers.get('host')?.split(':')[0]
  const baseDomain = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || '')
    .trim()
    .toLowerCase()

  if (!baseDomain) return NextResponse.next()
  if (url.pathname.startsWith('/_next')) return NextResponse.next()
  if (url.pathname.startsWith('/api')) return NextResponse.next()
  if (url.pathname.startsWith('/dev-storage')) return NextResponse.next()
  if (url.pathname.includes('.')) return NextResponse.next()

  if (!hostname || hostname === baseDomain) return NextResponse.next()
  const subdomain = hostname.split('.')[0]
  if (!subdomain || subdomain === baseDomain) return NextResponse.next()

  if (subdomain in VANITY_SUBDOMAINS) {
    const target = new URL(request.url)
    target.host = baseDomain
    target.pathname = VANITY_SUBDOMAINS[subdomain]
    target.search = ''
    return NextResponse.redirect(target, 302)
  }

  if (REWRITE_SUBDOMAINS.has(subdomain)) {
    const prefix = `/${subdomain}`
    // Already prefixed? (admin.example.com/admin/secret/users)
    // Leave as-is — /admin/secret/users is a valid route.
    // Otherwise prepend (admin.example.com/secret/users → /admin/secret/users).
    // This makes the site work even when links were generated with the
    // path-mode fallback (`/admin/...`) while running on a subdomain.
    if (url.pathname !== prefix && !url.pathname.startsWith(`${prefix}/`)) {
      url.pathname = `${prefix}${url.pathname}`
    }
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|svg|gif|webp|avif|ico|woff|woff2|ttf|otf)$).*)',
  ],
}
