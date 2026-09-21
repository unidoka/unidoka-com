import { NextResponse, NextRequest } from 'next/server';

export function proxy(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || "";

  // Admin route protection
  if (url.pathname.startsWith('/admin')) {
    const token = req.cookies.get('access_token');
    if (!token) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('from', url.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.includes('.') ||
    url.pathname.startsWith('/fake-api')
  ) {
    return NextResponse.next();
  }

  const isFakeApiSubdomain = hostname.startsWith('fake-api.');
  if (url.pathname.startsWith('/FAKE-API') && !isFakeApiSubdomain) {
    return NextResponse.rewrite(new URL('/404', req.url));
  }
  if (isFakeApiSubdomain) {
    return NextResponse.rewrite(new URL('FAKE-API/', req.url));
  }

  // If no redirects, continue
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files and api routes
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};
