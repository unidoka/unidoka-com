function normalizeRootDomain(raw: string | undefined | null): string {
  if (!raw) return "";
  let v = raw.trim().toLowerCase();
  v = v.replace(/^[a-z][a-z0-9+.-]*:\/\//, "");
  v = v.split("/")[0];
  v = v.split(":")[0];
  return v;
}
const ROOT_DOMAIN = normalizeRootDomain(process.env.NEXT_PUBLIC_ROOT_DOMAIN);
const CONFIGURED_PROTOCOL = (process.env.NEXT_PUBLIC_HTTP_PROTOCOL || "").trim().toLowerCase();
function resolvedScheme(): "http" | "https" {
  if (CONFIGURED_PROTOCOL === "http" || CONFIGURED_PROTOCOL === "https") {
    return CONFIGURED_PROTOCOL;
  }
  if (typeof window !== "undefined" && window.location.protocol === "http:") return "http";
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
  if (!ROOT_DOMAIN) return true;
  if (ROOT_DOMAIN === "localhost") return true;
  const h = currentHostname();
  if (!h) return false;
  return h === "localhost" || h.endsWith(".localhost") || h === "127.0.0.1";
}
export function getRootHost(): string | null {
  if (isPathMode()) return null;
  const hostname = currentHostname();
  if (!hostname) return null;
  if (hostname === ROOT_DOMAIN) return null;
  if (hostname.endsWith("." + ROOT_DOMAIN)) {
    const sub = hostname.slice(0, -(ROOT_DOMAIN.length + 1));
    if (sub && !sub.includes(".")) return ROOT_DOMAIN;
  }
  return null;
}
export function isOnSubdomain(): boolean {
  return getRootHost() !== null;
}
export function rootDomainUrl(path: string): string {
  const p = path.startsWith("/") ? path : "/" + path;
  if (isPathMode()) return p;
  const root = getRootHost();
  if (!root) return p;
  return `${resolvedScheme()}://${root}${currentPort()}${p}`;
}
export function crossSubdomainUrl(subdomain: string, path: string = "/"): string {
  const p = path.startsWith("/") ? path : "/" + path;
  if (isPathMode()) return `/${subdomain}${p}`;
  return `${resolvedScheme()}://${subdomain}.${ROOT_DOMAIN}${currentPort()}${p}`;
}
export function isAbsoluteUrl(href: string): boolean {
  return /^https?:\/\//i.test(href);
}
