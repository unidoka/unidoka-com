import { NextResponse, NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const url = req.nextUrl;
  const host = req.headers.get("host") || "";
  const hostname = host.split(":")[0];

  // ---- Skip static + API ----------------------------------------------
  if (
    url.pathname.startsWith("/_next") ||
    url.pathname.includes(".") ||
    url.pathname.startsWith("/fake-api")
  ) {
    return NextResponse.next();
  }

  // ---- Admin route protection ----------------------------------------
  if (url.pathname.startsWith("/admin")) {
    const token = req.cookies.get("access_token");
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("from", url.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ---- Fake API subdomain --------------------------------------------
  const isFakeApiSubdomain = hostname.startsWith("fake-api.");
  if (url.pathname.startsWith("/FAKE-API") && !isFakeApiSubdomain) {
    return NextResponse.rewrite(new URL("/404", req.url));
  }
  if (isFakeApiSubdomain) {
    return NextResponse.rewrite(new URL("FAKE-API/", req.url));
  }

  // ---- events.<domain> ------------------------------------------------
  // Anything hitting events.<domain> gets rewritten under /events so
  // the (Subdomains)/events route tree renders, but the URL bar keeps
  // the pretty host-relative path.
  if (hostname.startsWith("events.")) {
    if (url.pathname === "/") {
      return NextResponse.rewrite(new URL("/events", req.url));
    }
    if (!url.pathname.startsWith("/events")) {
      return NextResponse.rewrite(new URL(`/events${url.pathname}`, req.url));
    }
    return NextResponse.next();
  }

  // ---- 0leak.<domain> -------------------------------------------------
  if (hostname.startsWith("0leak.")) {
    if (!url.pathname.startsWith("/0leak")) {
      return NextResponse.rewrite(new URL(`/0leak${url.pathname}`, req.url));
    }
    return NextResponse.next();
  }

  // ---- site.com (root host) ------------------------------------------
  // IMPORTANT: do NOT redirect "/" to the events subdomain. That's
  // what was causing every hit to bounce to events.site.com.
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
