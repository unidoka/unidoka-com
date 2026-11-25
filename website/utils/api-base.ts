const LOOPBACK = new Set(["localhost", "127.0.0.1", "0.0.0.0", "[::1]"]);

/**
 * Base URL for browser-side API calls.
 *
 * Empty means "same origin", which is what dev rewrites and Traefik expect.
 * A `localhost` base is baked in by `website/.env` for local development; if
 * the page is opened from another host (LAN, tunnel, phone) that base points
 * at the *visitor's* machine and every request dies. In that case fall back
 * to same-origin instead of shipping a dead URL.
 */
export function apiBaseUrl(): string {
  const configured = (process.env.NEXT_PUBLIC_API_BASE_URL || "").trim();
  if (!configured) return "";
  if (typeof window === "undefined") return configured;

  try {
    const url = new URL(configured);
    if (LOOPBACK.has(url.hostname) && !LOOPBACK.has(window.location.hostname)) {
      return "";
    }
  } catch {
    return "";
  }
  return configured;
}
