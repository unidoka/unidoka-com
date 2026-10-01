"use client";
import { useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { CornerTicks } from "@/components/ui/corner-ticks";
import { ArrowLeft, ArrowClockwise } from "@phosphor-icons/react";
/**
 * Route-level error boundary. Next.js requires this to be a Client Component.
 *
 * Strings are INLINE and BILINGUAL on purpose: if the crash originated in the
 * language provider (or any provider above this boundary), calling
 * `useLanguage()` here would throw again and the page would white-screen. A
 * crisis page must not depend on the thing that might be on fire.
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface to browser console so Sentry / log drains pick it up.
    // eslint-disable-next-line no-console
    console.error("[error.tsx]", error);
  }, [error]);
  return (
    <main className="relative min-h-[80dvh] flex items-center overflow-hidden bg-(--bg)">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--on-bg-high) 1px, transparent 1px), linear-gradient(to bottom, var(--on-bg-high) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          maskImage:
            "radial-gradient(ellipse 60% 70% at 25% 40%, black 35%, transparent 90%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 60% 70% at 25% 40%, black 35%, transparent 90%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 45% 55% at 15% 15%, var(--primary-glass), transparent 65%)",
        }}
      />
      <Container variant="full-width" className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-10 lg:gap-20 items-start">
          <div className="relative border border-(--outline) bg-(--card) p-6 md:p-10">
            <CornerTicks />
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-(--on-bg-low) mb-6">
              ERR / INTERNAL
            </p>
            <p className="font-heading font-semibold leading-[0.85] tracking-[-0.06em] text-(--on-bg-high) text-[6rem] md:text-[10rem] tabular-nums">
              500
            </p>
            <div className="mt-8 pt-4 border-t border-(--outline) font-mono text-[11px] text-(--on-bg-low) space-y-1">
              <div className="flex justify-between gap-4">
                <span>status</span>
                <span className="text-(--error)">internal_error</span>
              </div>
              {error.digest && (
                <div className="flex justify-between gap-4">
                  <span>digest</span>
                  <span className="text-(--on-bg-medium) truncate">
                    {error.digest}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="pt-2 lg:pt-12">
            <h1 className="text-display-2 md:text-display-1 text-(--on-bg-high) leading-[1.05] tracking-[-0.02em] mb-6">
              Internal error
              <span className="block text-(--on-bg-medium) text-display-4 md:text-display-3 mt-3">
                Внутренняя ошибка
              </span>
            </h1>
            <p className="text-body-2 text-(--on-bg-medium) leading-relaxed max-w-[520px] mb-4">
              Something went wrong on our side. We already know. Try refreshing
              the page.
            </p>
            <p className="text-body-2 text-(--on-bg-medium) leading-relaxed max-w-[520px] mb-10">
              Что-то пошло не так на нашей стороне. Мы уже знаем об этом.
              Попробуйте обновить страницу.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="large" onClick={reset}>
                <ArrowClockwise className="size-4" />
                Retry / Обновить
              </Button>
              <Button size="large" variant="outlined" asChild>
                <Link href="/">
                  <ArrowLeft className="size-4" />
                  Home / На главную
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
