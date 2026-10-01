import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get("host")?.split(":")[0];
  const baseDomain = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "").trim().toLowerCase();
  if (!baseDomain) return NextResponse.next();
  if (url.pathname.startsWith("/_next")) return NextResponse.next();
  if (url.pathname.startsWith("/api")) return NextResponse.next();
  if (url.pathname.startsWith("/dev-storage")) return NextResponse.next();
  if (url.pathname.includes(".")) return NextResponse.next();
  if (!hostname || hostname === baseDomain) return NextResponse.next();
  const subdomain = hostname.split(".")[0];
  if (!subdomain || subdomain === baseDomain) return NextResponse.next();
  // (Subdomains) is a route GROUP — it does not appear in the URL.
  // Routes live at /app/* and /admin/* on the root domain, so a request
  // on app.* must be rewritten to /app/<path>, not /subdomains/app/<path>.
  url.pathname = `/${subdomain}${url.pathname}`;
  return NextResponse.rewrite(url);
}
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|svg|gif|webp|avif|ico|woff|woff2|ttf|otf)$).*)",
  ],
};
