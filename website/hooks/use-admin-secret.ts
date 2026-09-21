"use client";
import { useEffect, useState } from "react";

export function useAdminSecret() {
  const [secret, setSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[useAdminSecret] Fetching admin secret...');
    fetch("/api/admin-secret")
      .then(async (res) => {
        console.log(`[useAdminSecret] Response status: ${res.status}`);
        if (!res.ok) {
          console.log('[useAdminSecret] Not OK, returning null');
          return null;
        }
        const data = await res.json();
        console.log(`[useAdminSecret] Data:`, data);
        return data;
      })
      .then((data) => {
        setSecret(data?.secret || null);
        console.log(`[useAdminSecret] Secret set: ${data?.secret ? 'present' : 'null'}`);
      })
      .catch((err) => {
        console.error('[useAdminSecret] Fetch error:', err);
        setSecret(null);
      })
      .finally(() => setLoading(false));
  }, []);

  return { secret, loading };
}
