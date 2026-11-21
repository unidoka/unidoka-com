"use client";
import { useState } from "react";
import { ArrowUpRightIcon } from "@phosphor-icons/react";
import { AnimatedLogoIcon } from "@/components/layout/logo/animated-logo-icon";
import { AsciiLogo } from "@/components/layout/logo/ascii-logo";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { CornerTicks } from "@/components/ui/corner-ticks";
import { QuickOrderDialog } from "@/components/ui/quick-order-dialog";
import { useLanguage } from "@/providers/language-provider";

/**
 * Editorial hero: oversized type on the left, the ASCII mark on the right,
 * a thin ruled footer. The mark and the in-title glyph replay together.
 */
export function HeroSection({ ascii }: { ascii: string }) {
  const { t } = useLanguage();
  const [replay, setReplay] = useState(0);

  const replayMark = () => setReplay((n) => n + 1);

  return (
    <section className="relative isolate min-h-[100svh] w-full overflow-hidden">
      {/* Blueprint grid, faded at the edges so it reads as paper, not wallpaper. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, color-mix(in srgb, var(--on-bg-low), transparent 76%) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          maskImage:
            "radial-gradient(ellipse 90% 80% at 50% 42%, black 20%, transparent 82%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 90% 80% at 50% 42%, black 20%, transparent 82%)",
        }}
      />
      {/* One soft light source behind the mark. */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-18%] top-1/2 h-[78vh] w-[78vh] -translate-y-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--on-bg-high), transparent 93%), transparent 68%)",
        }}
      />

      <Container className="relative z-10 flex min-h-[100svh] flex-col px-6 sm:px-8 md:px-10 lg:px-14">
        <div className="grid flex-1 items-center gap-14 pt-28 pb-14 sm:pt-32 lg:grid-cols-[1.04fr_0.96fr] lg:gap-10 lg:pb-16 lg:pt-24">
          {/* ── Statement ─────────────────────────────────────────── */}
          <div className="max-w-2xl">
            <h1 className="animate-reveal fill-mode-both text-display-2 leading-[1.02]! tracking-tight text-(--on-bg-high) md:text-display-1 lg:text-display-0">
              <span className="flex items-center gap-[0.25rem]">
                <span>{t("hero.title.part1")}</span>
                <button
                  type="button"
                  onClick={replayMark}
                  aria-label={t("amorfa.hero_replay")}
                  title={t("amorfa.hero_replay")}
                  className="inline-flex size-[0.78em] shrink-0 -translate-y-[0.04em] cursor-pointer items-center justify-center self-center rounded-full text-(--on-bg-high) transition-transform duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary)/40"
                >
                  <AnimatedLogoIcon
                    replayKey={replay}
                    className="size-full"
                  />
                </button>
              </span>
            </h1>

            <p className="mt-7 max-w-lg animate-reveal fill-mode-both text-body-2 leading-relaxed text-(--on-bg-medium) [animation-delay:150ms] md:text-body-1">
              {t("hero.subtitle")}
            </p>
          </div>

          {/* ── ASCII mark ────────────────────────────────────────── */}
          <div className="relative flex items-center justify-center lg:justify-end">
            <div className="relative w-full max-w-[560px] px-3 py-5 sm:px-5">
              <CornerTicks size="md" />

              <button
                type="button"
                onClick={replayMark}
                aria-label={t("amorfa.hero_replay")}
                title={t("amorfa.hero_replay")}
                className="group relative block w-full cursor-pointer rounded-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary)/40 focus-visible:ring-offset-8 focus-visible:ring-offset-(--bg)"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -z-10 scale-[0.92] rounded-full opacity-60 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background:
                      "radial-gradient(circle, color-mix(in srgb, var(--on-bg-high), transparent 88%), transparent 70%)",
                  }}
                />
                <div className="w-full [container-type:inline-size]">
                  <AsciiLogo
                    ascii={ascii}
                    replayKey={replay}
                    className="w-full text-(--on-bg-high)"
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
export default HeroSection;
