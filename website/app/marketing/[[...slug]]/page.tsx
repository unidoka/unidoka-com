"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAdminSecret } from "@/hooks/use-admin-secret";

/**
 * Short-URL redirect for the admin marketing section.
 *
 * In local dev there is no reverse proxy, so admin routes live at
 * `/admin/{secret}/marketing/…` — the secret is part of the path.
 * Typing that by hand is tedious; typing `/marketing/tools` is
 * natural. This route captures the short form, reads the session's
 * admin secret, and forwards.
 *
 * In prod on the `admin.` subdomain, the proxy rewrites admin paths
 * before Next.js sees them, so this page never fires. It exists as a
 * dev affordance and as a link-friendly alias for anyone who types a
 * bare `/marketing/...`.
 *
 * The exact same pattern works for any other admin section — copy
 * this file into `app/<section>/[[...slug]]/page.tsx` and adjust the
 * section name in the replace regex and the destination path.
 */
export default function MarketingShortcut() {
  const router = useRouter();
  const pathname = usePathname();
  const { secret, loading } = useAdminSecret();

  useEffect(() => {
    if (loading) return;
    // No secret means: not signed in, or signed in as a non-admin.
    // Send them home rather than to a login wall that leaks the
    // existence of the admin route.
    if (!secret) {
      router.replace("/");
      return;
    }
    // pathname is the short form the browser asked for, e.g.
    // "/marketing/tools". Strip the leading "/marketing" and splice
    // it into the admin prefix the real routes use.
    const rest = pathname.replace(/^\/marketing/, "");
    router.replace(`/admin/${secret}/marketing${rest}`);
  }, [loading, secret, pathname, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-body-4 text-(--on-bg-low)">Перенаправление…</p>
    </div>
  );
}
