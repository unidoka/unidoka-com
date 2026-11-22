"use client";
import { useState } from "react";
import { AnimatedLogoIcon } from "@/components/layout/logo/animated-logo-icon";
import { AsciiLifeLogo } from "@/components/layout/logo/ascii-life-logo";
import { Container } from "@/components/ui/container";
import { useLanguage } from "@/providers/language-provider";

/**
 * Editorial hero: oversized type on the left, a living ASCII mark on the
 * right. The mark is a Game-of-Life colony inside the wordmark; clicking
 * it - or the glyph in the headline - seeds a fresh one.
 */
export function HeroSection({ ascii }: { ascii: string }) {
  const { t } = useLanguage();
  const [replay, setReplay] = useState(0);

  const replayMark = () => setReplay((n) => n + 1);

  // Keep the mark glued to the last word: if the headline wraps, the
  // icon must travel with "together"/"лучше", not sit in its own box.
  const titleWords = t("hero.title.part1").trim().split(/\s+/);
  const lastWord = titleWords[titleWords.length - 1] ?? "";
  const leadingWords = titleWords.slice(0, -1).join(" ");

  return (
    <section className="relative isolate w-full overflow-hidden">
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
        className="pointer-events-none absolute right-[-18%] top-1/2 h-[60vh] w-[60vh] -translate-y-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--on-bg-high), transparent 93%), transparent 68%)",
        }}
      />

      <Container className="relative z-10 pt-24 pb-10 md:pt-28 md:pb-14">
        <div className="grid items-center gap-12 md:gap-14 lg:grid-cols-[1.04fr_0.96fr] lg:gap-10">
          <div className="relative z-10">
            <h1 className="animate-reveal fill-mode-both text-display-2 md:text-display-1 lg:text-display-0">
              {leadingWords ? `${leadingWords} ` : null}
              <span className="inline-flex items-center gap-[0.16em] whitespace-nowrap">
                {lastWord}
                <button
                  type="button"
                  onClick={replayMark}
                  aria-label={t("amorfa.hero_replay")}
                  title={t("amorfa.hero_replay")}
                  className="inline-flex size-[0.72em] shrink-0 cursor-pointer items-center justify-center rounded-full text-(--on-bg-high) transition-transform duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary)/40"
                >
                  <AnimatedLogoIcon replayKey={replay} className="size-full" />
                </button>
              </span>
            </h1>

            <p className="mt-7 max-w-lg animate-reveal fill-mode-both text-body-2 leading-relaxed text-(--on-bg-medium) [animation-delay:150ms] md:text-body-1">
              {t("hero.subtitle")}
            </p>
          </div>

          <div className="relative flex animate-reveal items-center justify-center fill-mode-both [animation-delay:220ms] lg:justify-end xl:pointer-events-none xl:absolute xl:inset-0 xl:-z-10 xl:items-center xl:justify-center">
            <div className="relative w-full max-w-[460px] px-2 py-4 sm:px-4 xl:h-full xl:max-w-none xl:px-0 xl:py-0 xl:[mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_78%)]">
              <button
                type="button"
                onClick={replayMark}
                aria-label={t("amorfa.hero_replay")}
                title={t("amorfa.hero_replay")}
                className="group relative block w-full cursor-pointer rounded-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary)/40 focus-visible:ring-offset-8 focus-visible:ring-offset-(--bg) xl:h-full xl:pointer-events-none"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -z-10 scale-[0.9] rounded-full opacity-60 blur-2xl transition-opacity duration-500 group-hover:opacity-100 xl:hidden"
                  style={{
                    background:
                      "radial-gradient(circle, color-mix(in srgb, var(--on-bg-high), transparent 90%), transparent 70%)",
                  }}
                />
                <AsciiLifeLogo
                  ascii={ascii}
                  replayKey={replay}
                  className="text-(--on-bg-high) xl:h-full xl:w-full xl:object-cover xl:opacity-[0.09]"
                />
              </button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
export default HeroSection;
