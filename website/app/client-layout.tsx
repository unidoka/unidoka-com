"use client";
import "./globals.css";
import Header from "@/components/layout/nav/header";
import Footer from "@/components/layout/nav/footer";
import { Toaster } from "@/components/ui/sonner";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/container";
import { PlacementSlot } from "@/components/marketing/placements/placement-slot";

/**
 * Derive the placement `page` value from the URL.
 *
 * Placements target a route prefix — `events` matches /events and any
 * nested route, `home` matches the root. The reserved value `global`
 * is set on the placement itself, not here; the public API treats it
 * as "matches every page".
 *
 * The editor's page picker offers exactly these values, so the two
 * sides can't drift. Admin and profile routes resolve to `admin` /
 * `app` and match no placement — no special-casing needed.
 */
function derivePage(pathname: string): string {
  const trimmed = pathname.replace(/^\/+|\/+$/g, "");
  if (!trimmed) return "home";
  return trimmed.split("/")[0];
}

export default function ClientRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const hideChrome =
    pathname?.startsWith("/admin") || pathname?.startsWith("/app");
  const page = derivePage(pathname ?? "/");

  return (
    <div className="flex min-h-[100dvh] flex-col">
      {/* Top strip sits above the header — the "top" placement type is
          defined as "the first thing on the page".
          pt-[72px]/sm:pt-[100px] clears the fixed header so a placement
          isn't hidden under it — but it's on the SLOT, not the
          Container, so it collapses to nothing when no placement is
          live. Applying it to the Container reserved ~100px of empty
          grid on every page. */}
      {!hideChrome && (
        <Container>
          <PlacementSlot
            type="top"
            page={page}
            className="pt-[72px] sm:pt-[100px]"
          />
        </Container>
      )}

      <Header />

      <main className={cn("flex-1", "mb-0")}>{children}</main>

      {/* Toast — fixed bottom-right, out of flow. */}
      {!hideChrome && (
        <div className="fixed bottom-4 right-4 z-50 max-w-md pointer-events-none">
          <div className="pointer-events-auto">
            <PlacementSlot type="toast" page={page} />
          </div>
        </div>
      )}

      {/* Dialog — full-screen overlay, renders only when one matches. */}
      {!hideChrome && <PlacementSlot type="dialog" page={page} />}

      {!hideChrome && <Footer />}
      <Toaster position="bottom-right" closeButton gap={8} visibleToasts={3} />
    </div>
  );
}
