"use client";
import { useEffect, useState } from "react";

/**
 * Loads the admin route secret for the current session.
 *
 * Pass `enabled` as a gate so the header refetches after an SPA login:
 * the header mounts while unauthenticated, so a one-shot fetch would
 * cache the 401 and never show the admin link until a full reload.
 */
export function useAdminSecret(enabled = true) {
  const [secret, setSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/admin-secret", {
          cache: "no-store",
        });
        if (!res.ok) {
          if (!cancelled) setSecret(null);
          return;
        }
        const data = await res.json();
        if (!cancelled) setSecret(data?.secret || null);
      } catch (err) {
        console.error("[useAdminSecret] fetch failed:", err);
        if (!cancelled) setSecret(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [enabled]);
  return { secret, loading };
}
