"use client";
import { useEffect, useState } from "react";

function normalizeRootDomain(raw?: string): string {
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
const PROTOCOL =
  (process.env.NEXT_PUBLIC_HTTP_PROTOCOL || "").trim().toLowerCase() || "https";

function inferRootDomain(hostname: string): string {
  const h = hostname.toLowerCase();
  if (
    h === "localhost" ||
    h === "127.0.0.1" ||
    h === "0.0.0.0" ||
    h === "[::1]" ||
    h.endsWith(".localhost")
  )
    return "";
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(h)) return h;
  const parts = h.split(".");
  if (parts.length <= 2) return h;
  return parts.slice(1).join(".");
}

/**
 * Returns the root-domain URL ("https://unidoka.com" on subdomains,
 * "/" on root/dev). Always hydration-safe: starts at "/", then updates
 * via `useEffect` after mount.
 */
export function useRootHref(): string {
  const [href, setHref] = useState("/");
  useEffect(() => {
    const host = window.location.hostname.toLowerCase();
    const root = BUILD_ROOT_DOMAIN || inferRootDomain(host);
    if (!root) return;
    if (host === root) return;
    if (host.endsWith("." + root)) {
      const port = window.location.port ? ":" + window.location.port : "";
      setHref(`${PROTOCOL}://${root}${port}`);
    }
  }, []);
  return href;
}
