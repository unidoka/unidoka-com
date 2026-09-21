import { NextResponse, NextRequest } from 'next/server';

export function proxy(req: NextRequest) {
  const url = req.nextUrl;
  const host = req.headers.get('host') || "";
  const hostname = host.split(":")[0];

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

  const isEventsSubdomain = hostname.startsWith('events.');
  if (isEventsSubdomain) {
    // `/` on events.<domain> -> /events  (the events list)
    // /vershiny already maps 1:1 to /events/vershiny
    if (url.pathname === '/') {
      console.log(`[proxy] ${hostname}/ -> /events`);
      return NextResponse.rewrite(new URL('/events', req.url));
    }
    if (!url.pathname.startsWith('/events')) {
      const rewritten = `/events${url.pathname}`;
      console.log(`[proxy] ${hostname}${url.pathname} -> ${rewritten}`);
      return NextResponse.rewrite(new URL(rewritten, req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};
