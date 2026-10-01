"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
export function useDialogParam(key: string) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const value = searchParams.get(key);
  const isOpen = value !== null;
  const open = useCallback(
    (v: string = "1") => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(key, v);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [key, pathname, router, searchParams],
  );
  const close = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [key, pathname, router, searchParams]);
  const isNew = value === "new";
  return useMemo(() => ({ value, isOpen, isNew, open, close }), [value, isOpen, isNew, open, close]);
}
