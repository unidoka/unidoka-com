// Root-domain detection with runtime fallback.
//
// NEXT_PUBLIC_ROOT_DOMAIN is inlined at BUILD time. If it is empty (or
// literally "localhost") when `next build` runs, we cannot build any
// absolute URL, and every cross-subdomain link has to fall back to
// path mode (`/admin/...`). On prod, path-mode links on a subdomain
// host get prefixed again by the proxy and drift the URL bar.
//
// This module fixes that by:
//   1. Inferring the root domain at runtime from window.location.hostname
//      when the env var is missing.
//   2. Returning a RELATIVE path when the current host already IS the
//      target subdomain (avoids the ugly admin.unidoka.com/admin/...).
//   3. Flipping to the accurate form only after React has hydrated,
//      so the server and the first client render agree — no hydration
//      mismatch on `href` attributes.

function normalizeRootDomain(raw: string | undefined | null): string {
  if (!raw) return "";
  let v = raw.trim().toLowerCase();
  v = v.replace(/^[a-z][a-z0-9+.-]*:\/\//, "");
  v = v.split("/")[0];
  v = v.split(":")[0];
  return v;
}

const BUILD_ROOT_DOMAIN = normalizeRootDomain(
  process.env.NEXT_PUBLIC_ROOT_DOMAIN,
);
const CONFIGURED_PROTOCOL = (process.env.NEXT_PUBLIC_HTTP_PROTOCOL || "")
  .trim()
  .toLowerCase();

// Flip to true one tick after the client module loads. `setTimeout(0)`
// runs after the current task — i.e. after React commits hydration —
// so the initial render sees `false` and matches the SSR output.
// Any later re-render (driven by useUser, useAdminSecret, etc.) sees
// the updated value and produces clean URLs.
let __hydrated = false;
if (typeof window !== "undefined") {
  setTimeout(() => {
    __hydrated = true;
  }, 0);
}

function inferRootDomain(): string {
  if (typeof window === "undefined") return "";
  const h = window.location.hostname.toLowerCase();
  if (
    h === "localhost" ||
    h === "127.0.0.1" ||
    h === "0.0.0.0" ||
    h === "[::1]" ||
    h.endsWith(".localhost")
  )
    return "";
  // Bare IPv4 — treat as root, no subdomain.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(h)) return h;
  const parts = h.split(".");
  if (parts.length <= 2) return h; // already root
  // Strip first segment assuming it's a subdomain. Works for .com/.ru/
  // .io etc. For multi-part TLDs (.co.uk) set NEXT_PUBLIC_ROOT_DOMAIN
  // explicitly, or the inference will treat "co.uk" as root.
  return parts.slice(1).join(".");
}

function getRootDomain(): string {
  if (BUILD_ROOT_DOMAIN) return BUILD_ROOT_DOMAIN;
  return inferRootDomain();
}

function resolvedScheme(): "http" | "https" {
  if (CONFIGURED_PROTOCOL === "http" || CONFIGURED_PROTOCOL === "https") {
    return CONFIGURED_PROTOCOL;
  }
  if (typeof window !== "undefined" && window.location.protocol === "http:")
    return "http";
  return "https";
}

function currentPort(): string {
  if (typeof window === "undefined") return "";
  return window.location.port ? ":" + window.location.port : "";
}

function currentHostname(): string | null {
  if (typeof window === "undefined") return null;
  return window.location.hostname.toLowerCase();
}

export function isPathMode(): boolean {
  const h = currentHostname();
  if (!h) return !getRootDomain(); // SSR: no window to inspect
  if (
    h === "localhost" ||
    h.endsWith(".localhost") ||
    h === "127.0.0.1" ||
    h === "0.0.0.0" ||
    h === "[::1]"
  )
    return true;
  return !getRootDomain();
}

export function currentSubdomain(): string | null {
  if (typeof window === "undefined") return null;
  const root = getRootDomain();
  if (!root) return null;
  const h = window.location.hostname.toLowerCase();
  if (h === root) return null;
  if (h.endsWith("." + root)) {
    const sub = h.slice(0, -(root.length + 1));
    if (sub && !sub.includes(".")) return sub;
  }
  return null;
}

export function getRootHost(): string | null {
  if (!currentSubdomain()) return null;
  return getRootDomain();
}

export function isOnSubdomain(): boolean {
  return currentSubdomain() !== null;
}

export function rootDomainUrl(path: string): string {
  const p = path.startsWith("/") ? path : "/" + path;
  // SSR + first client render: relative path so server and client agree.
  if (!__hydrated) return p;
  if (isPathMode()) return p;
  const root = getRootDomain();
  if (!root) return p;
  const h = currentHostname();
  // Already on the root host — stay relative, no reason to be absolute.
  if (h === root) return p;
  // On a subdomain — go up to the root domain.
  return `${resolvedScheme()}://${root}${currentPort()}${p}`;
}

export function crossSubdomainUrl(
  subdomain: string,
  path: string = "/",
): string {
  const p = path.startsWith("/") ? path : "/" + path;

  // SSR + first client render: path mode. Matches SSR output, so no
  // hydration warning on the `href` attribute.
  if (!__hydrated) return `/${subdomain}${p}`;

  if (isPathMode()) return `/${subdomain}${p}`;

  const root = getRootDomain();
  if (!root) return `/${subdomain}${p}`;

  // Already on the target subdomain — return relative so the browser
  // doesn't prepend `/admin` on top of `/admin.unidoka.com`.
  if (currentSubdomain() === subdomain) return p;

  return `${resolvedScheme()}://${subdomain}.${root}${currentPort()}${p}`;
}

export function isAbsoluteUrl(href: string): boolean {
  return /^https?:\/\//i.test(href);
}
