"use client";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { CornerTicks } from "@/components/ui/corner-ticks";
import { useLanguage } from "@/providers/language-provider";
import { ArrowLeft, ArrowRight, Warning } from "@phosphor-icons/react";
export default function ForbiddenPage() {
  const { t } = useLanguage();
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
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-(--on-bg-low) mb-6 flex items-center gap-2">
              <Warning className="size-3 text-(--warning)" weight="fill" />
              {t("Errors.forbiddenLabel")}
            </p>
            <p className="font-heading font-semibold leading-[0.85] tracking-[-0.06em] text-(--on-bg-high) text-[6rem] md:text-[10rem] tabular-nums">
              403
            </p>
            <div className="mt-8 pt-4 border-t border-(--outline) font-mono text-[11px] text-(--on-bg-low) space-y-1">
              <div className="flex justify-between gap-4">
                <span>status</span>
                <span className="text-(--warning)">forbidden</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>action</span>
                <span className="text-(--on-bg-medium)">sign_in</span>
              </div>
            </div>
          </div>
          <div className="pt-2 lg:pt-12">
            <h1 className="text-display-2 md:text-display-1 text-(--on-bg-high) leading-[1.05] tracking-[-0.02em] mb-6">
              {t("Errors.forbiddenTitle")}
            </h1>
            <p className="text-body-2 text-(--on-bg-medium) leading-relaxed max-w-[520px] mb-10">
              {t("Errors.forbiddenBody")}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="large" asChild>
                <Link href="/login">
                  Sign in
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="large" variant="outlined" asChild>
                <Link href="/">
                  <ArrowLeft className="size-4" />
                  {t("Errors.back")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
