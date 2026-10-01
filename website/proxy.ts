import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Only 0leak.* is a real subdomain now. Events live at /events on the
// root domain — a request on events.* will not be rewritten and Next.js
// will 404 it (which is the intended behaviour after this change).
export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get("host")?.split(":")[0];
  const baseDomain = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "")
    .trim()
    .toLowerCase();

  if (!baseDomain) return NextResponse.next();
  if (url.pathname.startsWith("/_next")) return NextResponse.next();
  if (url.pathname.startsWith("/api")) return NextResponse.next();
  if (url.pathname.startsWith("/dev-storage")) return NextResponse.next();
  if (url.pathname.includes(".")) return NextResponse.next();
  if (!hostname || hostname === baseDomain) return NextResponse.next();

  const subdomain = hostname.split(".")[0];
  if (!subdomain || subdomain === baseDomain) return NextResponse.next();

  // Only rewrite for known subdomains. Anything else (events.*, stray
  // hostnames) falls through untouched and renders the root site.
  if (subdomain !== "0leak" && subdomain !== "app" && subdomain !== "admin") {
    return NextResponse.next();
  }

  url.pathname = `/${subdomain}${url.pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|svg|gif|webp|avif|ico|woff|woff2|ttf|otf)$).*)",
  ],
};
