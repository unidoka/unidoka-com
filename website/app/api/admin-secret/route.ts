import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * Returns the admin secret for the current user, or a structured error.
 *
 * Failure responses carry a `reason` field so DevTools shows why the
 * call failed without needing to read the server logs:
 *
 *   { secret: null, reason: "no_token" }        — session cookie missing
 *   { secret: null, reason: "no_base_url" }     — server env misconfigured
 *   { secret: null, reason: "backend_unreachable", detail: "..." }
 *   { secret: null, reason: "unauthorized",   status: 401 }
 *   { secret: null, reason: "not_admin",      role: "user" }
 *   { secret: null, reason: "no_secret_env" }   — ADMIN_SECRET_URI unset
 *   { secret: "admin-…" }                        — success
 *
 * HTTP status codes still convey the class (401/403/500/502), so the
 * client can branch on either. The extra `reason` field only helps
 * when a human is staring at the Network tab.
 */
export async function GET() {
  const token = (await cookies()).get("access_token")?.value;
  if (!token) {
    return NextResponse.json(
      { secret: null, reason: "no_token" },
      { status: 401 },
    );
  }

  // Server-side fetch — needs an absolute URL. The browser never sees
  // this value; it's only used inside the Next.js Node process.
  const baseUrl =
    process.env.API_BASE_URL_INTERNAL ||
    process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!baseUrl || !/^https?:\/\//i.test(baseUrl)) {
    console.error(
      "[admin-secret] API_BASE_URL_INTERNAL / NEXT_PUBLIC_API_BASE_URL " +
      "is missing or not an absolute URL. Got:",
      JSON.stringify(baseUrl),
    );
    return NextResponse.json(
      { secret: null, reason: "no_base_url" },
      { status: 500 },
    );
  }

  let res: Response;
  try {
    res = await fetch(`${baseUrl}/api/v1/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  } catch (err) {
    console.error("[admin-secret] backend fetch failed:", err);
    return NextResponse.json(
      {
        secret: null,
        reason: "backend_unreachable",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 502 },
    );
  }

  if (!res.ok) {
    return NextResponse.json(
      { secret: null, reason: "unauthorized", status: res.status },
      { status: res.status === 401 ? 401 : 502 },
    );
  }

  let user: { role?: string } | null = null;
  try {
    user = await res.json();
  } catch {
    return NextResponse.json(
      { secret: null, reason: "invalid_backend_response" },
      { status: 502 },
    );
  }

  if (user?.role !== "admin" && user?.role !== "root") {
    return NextResponse.json(
      { secret: null, reason: "not_admin", role: user?.role ?? null },
      { status: 403 },
    );
  }

  const secret = process.env.ADMIN_SECRET_URI;
  if (!secret) {
    return NextResponse.json(
      { secret: null, reason: "no_secret_env" },
      { status: 500 },
    );
  }

  return NextResponse.json({ secret });
}
