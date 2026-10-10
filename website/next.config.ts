import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");
const isDev = process.env.NODE_ENV === "development";
const hasAbsoluteApi = !!process.env.NEXT_PUBLIC_API_BASE_URL;

const nextConfig: NextConfig = {
  output: "standalone",
  // LLM context: prod routes /api/v1, /docs, /health to FastAPI via
  // Traefik. `npm run dev` runs only Next.js, no Traefik - so a relative
  // fetch("/api/v1/...") 404s, while an absolute http://localhost:8000
  // hits FastAPI cross-origin and trips CORS. These rewrites give dev the
  // same same-origin proxy shape as prod. Skipped in prod and skipped
  // when an absolute NEXT_PUBLIC_API_BASE_URL is set on purpose.
  async rewrites() {
    if (!isDev || hasAbsoluteApi) return [];
    const backend = process.env.DEV_BACKEND_URL || "http://localhost:8000";
    return [
      { source: "/api/v1/:path*", destination: `${backend}/api/v1/:path*` },
      { source: "/docs", destination: `${backend}/docs` },
      { source: "/docs/:path*", destination: `${backend}/docs/:path*` },
      { source: "/health", destination: `${backend}/health` },
    ];
  },
  // LLM context: on a 1-CPU box, webpack spends most of its time
  // resolving barrel files. optimizePackageImports rewrites
  // `import { X } from "pkg"` into a deep import so only the used
  // modules are parsed. @phosphor-icons/react is the worst offender
  // in this repo (thousands of icons behind one entry point).
  experimental: {
    optimizePackageImports: [
      "@phosphor-icons/react",
      "recharts",
      "date-fns",
    ],
  },
};

export default withNextIntl(nextConfig);
