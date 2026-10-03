import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Host-based routing.
 *
 *   Real subdomains (have their own route folder under app/(Subdomains)/):
 *     app.*    → rewrite to /app/<path>
 *     admin.*  → rewrite to /admin/<path>
 *     0leak.*  → rewrite to /0leak/<path>
 *
 *   Vanity subdomains (no folder - they exist only as bookmarks / legacy):
 *     amorfa.*   → 302 to <root>/amorfa
 *     events.*   → 302 to <root>/events
 *     vershiny.* → 302 to <root>/vershiny
 *
 *   Everything else (root domain, plain routes) is served unchanged.
 *   /events, /vershiny, /amorfa are ROOT ROUTES, not subdomains.
 */

// Subdomains that map to a single root route and should 302 there.
const VANITY_SUBDOMAINS: Record<string, string> = {
  amorfa: '/amorfa',
  events: '/events',
  vershiny: '/vershiny',
}

// Subdomains that have their own route folder under app/(Subdomains)/.
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
  // Static assets - never rewrite these.
  if (url.pathname.includes('.')) return NextResponse.next()

  // Root domain: normal route serving, no rewriting.
  if (!hostname || hostname === baseDomain) return NextResponse.next()

  const subdomain = hostname.split('.')[0]
  if (!subdomain || subdomain === baseDomain) return NextResponse.next()

  // ── Vanity subdomain → 302 to the equivalent root route ──────────
  if (subdomain in VANITY_SUBDOMAINS) {
    const target = new URL(request.url)
    target.host = baseDomain
    target.pathname = VANITY_SUBDOMAINS[subdomain]
    target.search = ''
    return NextResponse.redirect(target, 302)
  }

  // ── Real subdomain → rewrite to its route folder ─────────────────
  if (REWRITE_SUBDOMAINS.has(subdomain)) {
    url.pathname = `/${subdomain}${url.pathname}`
    return NextResponse.rewrite(url)
  }

  // Unknown subdomain: fall through and render the root site.
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|svg|gif|webp|avif|ico|woff|woff2|ttf|otf)$).*)',
  ],
}
