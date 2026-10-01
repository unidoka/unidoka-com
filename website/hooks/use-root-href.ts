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
const ROOT_DOMAIN = normalizeRootDomain(process.env.NEXT_PUBLIC_ROOT_DOMAIN);
const PROTOCOL = (process.env.NEXT_PUBLIC_HTTP_PROTOCOL || "").trim().toLowerCase() || "https";
export function useRootHref(): string {
  const [href, setHref] = useState("/");
  useEffect(() => {
    if (!ROOT_DOMAIN) return;
    if (ROOT_DOMAIN === "localhost") return;
    const host = window.location.hostname.toLowerCase();
    if (host === "localhost" || host.endsWith(".localhost") || host === "127.0.0.1") return;
    if (host !== ROOT_DOMAIN && host.endsWith(`.${ROOT_DOMAIN}`)) {
      setHref(`${PROTOCOL}://${ROOT_DOMAIN}`);
    }
  }, []);
  return href;
}
