"use client";
import { useEffect, useState } from "react";

export type Subdomain = "site" | "events" | "0leak";

interface HostContext {
  subdomain: Subdomain;
  /** e.g. "localhost:3000" or "unidoka.com" — no subdomain, port kept. */
  rootHost: string;
  protocol: "http" | "https";
  /**
   * Build an absolute URL on the same root.
   *   urlFor("events", "/vershiny") -> "https://events.unidoka.com/vershiny"
   *   urlFor("", "/")              -> "https://unidoka.com/"
   */
  urlFor: (sub: Subdomain | "", path: string) => string;
}

const SSR_ROOT = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
const SSR_PROTOCOL: "http" | "https" =
  process.env.NODE_ENV === "production" ? "https" : "http";

const SUBDOMAIN_PREFIX = /^(events|0leak)\./;

function parseSubdomain(hostname: string): Subdomain {
  if (hostname.startsWith("events.")) return "events";
  if (hostname.startsWith("0leak.")) return "0leak";
  return "site";
}

function stripSubdomain(host: string): string {
  return host.replace(SUBDOMAIN_PREFIX, "");
}

function makeUrlFor(rootHost: string, protocol: string) {
  return (sub: Subdomain | "", path: string): string => {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    const host = sub ? `${sub}.${rootHost}` : rootHost;
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
    // window.location.host keeps the port ("events.localhost:3000").
    // Strip our known prefixes to get the true root host.
    const fullHost = window.location.host;
    const rootHost = stripSubdomain(fullHost);
    const protocol = window.location.protocol.replace(":", "") as "http" | "https";
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

// Convenience for callers that only need the subdomain.
export function useSubdomain(): Subdomain {
  return useHost().subdomain;
}
