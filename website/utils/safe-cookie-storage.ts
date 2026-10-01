import Cookies from "js-cookie";
function normalizeHost(raw?: string): string {
  if (!raw) return "";
  let v = raw.trim().toLowerCase();
  v = v.replace(/^[a-z][a-z0-9+.-]*:\/\//, "");
  v = v.split("/")[0];
  v = v.split(":")[0];
  return v;
}
// NEXT_PUBLIC_ROOT_DOMAIN is inlined at BUILD time. Set it as a build arg
// in docker-compose AND have it present at build time.
const ROOT_RAW = normalizeHost(process.env.NEXT_PUBLIC_ROOT_DOMAIN);
const IS_LOCAL = ROOT_RAW === "localhost" || ROOT_RAW.endsWith(".localhost");
const COOKIE_DOMAIN = ROOT_RAW && !IS_LOCAL ? "." + ROOT_RAW : undefined;
const isHttps = process.env.NEXT_PUBLIC_PROTOCOL === "https";
export const safeCookieStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === "undefined") return null;
    try {
      return Cookies.get(key) || null;
    } catch (e) {
      console.warn("Cookie unavailable (read)", e);
      return null;
    }
  },
  setItem: (key: string, value: string | number, expiresDays: number = 7): void => {
    if (typeof window === "undefined") return;
    try {
      Cookies.set(key, String(value), {
        expires: expiresDays,
        ...(COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {}),
        path: "/",
        sameSite: "lax",
        secure: isHttps,
      });
    } catch (e) {
      console.warn("Cookie unavailable (write)", e);
    }
  },
  removeItem: (key: string): void => {
    if (typeof window === "undefined") return;
    try {
      if (COOKIE_DOMAIN) Cookies.remove(key, { domain: COOKIE_DOMAIN, path: "/" });
      // Also clear any host-only legacy copy.
      Cookies.remove(key, { path: "/" });
    } catch (e) {
      console.warn("Cookie unavailable (delete)", e);
    }
  },
};
