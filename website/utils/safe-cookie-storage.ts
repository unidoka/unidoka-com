import Cookies from "js-cookie";

/**
 * Cookie storage with runtime hostname detection.
 *
 * The critical insight: `NEXT_PUBLIC_ROOT_DOMAIN` is inlined at BUILD
 * time. If you build with `unidoka.com` and then serve on `localhost`,
 * hard-coding `domain=.unidoka.com` makes the browser silently reject
 * every cookie (domain mismatch), and `secure: true` over http:// is
 * rejected too. The result is "login works, refresh logs you out".
 *
 * So we read `window.location` at call time instead of trusting the
 * build-time env var. Behaviour:
 *   localhost / 127.0.0.1 / *.localhost / raw IP  -> host-only cookie
 *   unidoka.com or *.unidoka.com over https       -> .unidoka.com cookie
 *   any other host NOT covered by ROOT_DOMAIN     -> host-only cookie
 *
 * `secure` is set only when the page is actually https, so http:// dev
 * servers get their cookies too.
 */

function normalizeRoot(raw?: string): string {
  if (!raw) return "";
  let v = raw.trim().toLowerCase();
  v = v.replace(/^[a-z][a-z0-9+.-]*:\/\//, "");
  v = v.split("/")[0];
  v = v.split(":")[0];
  return v;
}

const ROOT_DOMAIN = normalizeRoot(process.env.NEXT_PUBLIC_ROOT_DOMAIN);

const IP_RE = /^\d{1,3}(\.\d{1,3}){3}$/;

function isLocalHostname(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0" ||
    hostname === "[::1]" ||
    IP_RE.test(hostname)
  );
}

interface CookieOpts {
  path: string;
  sameSite: "lax";
  secure: boolean;
  domain?: string;
}

function currentOptions(): CookieOpts {
  // Guard for SSR - cookie ops only ever run client-side anyway.
  if (typeof window === "undefined") {
    return { path: "/", sameSite: "lax", secure: false };
  }

  const hostname = window.location.hostname.toLowerCase();
  const isHttps = window.location.protocol === "https:";

  const opts: CookieOpts = {
    path: "/",
    sameSite: "lax",
    // `secure: true` on http://localhost causes the browser to drop the
    // cookie. Only flag it when we're actually on https.
    secure: isHttps,
  };

  // Local dev / raw IP: host-only cookies always work, and there are no
  // subdomains to share with, so skip the domain attribute entirely.
  if (isLocalHostname(hostname)) return opts;

  // Real domain: share across subdomains only if we're actually on that
  // domain (or a subdomain of it). Otherwise, host-only.
  if (ROOT_DOMAIN) {
    if (hostname === ROOT_DOMAIN || hostname.endsWith("." + ROOT_DOMAIN)) {
      opts.domain = "." + ROOT_DOMAIN;
    }
  }

  return opts;
}

export const safeCookieStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === "undefined") return null;
    try {
      return Cookies.get(key) || null;
    } catch (e) {
      console.warn("[cookie] read failed", e);
      return null;
    }
  },

  setItem: (key: string, value: string | number, expiresDays = 7): void => {
    if (typeof window === "undefined") return;
    try {
      Cookies.set(key, String(value), {
        expires: expiresDays,
        ...currentOptions(),
      });
    } catch (e) {
      console.warn("[cookie] write failed", e);
    }
  },

  removeItem: (key: string): void => {
    if (typeof window === "undefined") return;
    try {
      // Remove using the same options we set with - the browser only
      // matches a cookie for deletion when domain/path line up exactly.
      Cookies.remove(key, currentOptions() as any);
      // Legacy host-only copy from a previous build, if any.
      Cookies.remove(key, { path: "/" });
    } catch (e) {
      console.warn("[cookie] remove failed", e);
    }
  },

  /** Dev helper. Call `window.__cookies.debug()` in the console. */
  debug: (): { options: CookieOpts; cookies: Record<string, string> } => {
    if (typeof window === "undefined") {
      return {
        options: { path: "/", sameSite: "lax", secure: false },
        cookies: {},
      };
    }
    return {
      options: currentOptions(),
      cookies: Cookies.get() as Record<string, string>,
    };
  },
};

// Expose on window in dev only, so the console can inspect the live
// cookie options without a module import.
if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
  (window as any).__cookies = safeCookieStorage;
}
