"use client";
import { useEffect, useState } from "react";
export function useAdminSecret() {
  const [secret, setSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
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
  }, []);
  return { secret, loading };
}
