"use client";
import { useEffect, useState } from "react";

// Events are no longer a subdomain - only 0leak and the root remain.
// "site" means "the root domain, no subdomain".
export type Subdomain = "site" | "0leak";

interface HostContext {
  subdomain: Subdomain;
  rootHost: string;
  protocol: "http" | "https";
  urlFor: (sub: Subdomain | "", path: string) => string;
}

const SSR_ROOT = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
const SSR_PROTOCOL: "http" | "https" =
  process.env.NODE_ENV === "production" ? "https" : "http";

const SUBDOMAIN_PREFIX = /^0leak\./;

function parseSubdomain(hostname: string): Subdomain {
  if (hostname.startsWith("0leak.")) return "0leak";
  return "site";
}

function stripSubdomain(host: string): string {
  return host.replace(SUBDOMAIN_PREFIX, "");
}

function makeUrlFor(rootHost: string, protocol: string) {
  return (sub: Subdomain | "", path: string): string => {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    // "site" and "" both mean the root domain.
    const host =
      sub && sub !== "site" ? `${sub}.${rootHost}` : rootHost;
    return `${protocol}://${host}${cleanPath}`;
  };
}

export function useHost(): HostContext {
  const [ctx, setCtx] = useState<HostContext>(() => ({
    subdomain: "site",
    rootHost: SSR_ROOT,
    protocol: SSR_PROTOCOL,
    urlFor: makeUrlFor(SSR_ROOT, SSR_PROTOCOL),
  }));

  useEffect(() => {
    const fullHost = window.location.host;
    const rootHost = stripSubdomain(fullHost);
    const protocol = window.location.protocol.replace(":", "") as
      | "http"
      | "https";
    const subdomain = parseSubdomain(window.location.hostname);
    setCtx({
      subdomain,
      rootHost,
      protocol,
      urlFor: makeUrlFor(rootHost, protocol),
    });
  }, []);

  return ctx;
}

export function useSubdomain(): Subdomain {
  return useHost().subdomain;
}
