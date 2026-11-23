"use client";

import { useState } from "react";
import Link from "next/link";
import { AsciiLifeLogo } from "@/components/layout/logo/ascii-life-logo";
import { VershinyLogoIcon } from "@/components/icons/logotypes/vershiny-logo-icon";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { useLanguage } from "@/providers/language-provider";

const JOIN_URL = "https://t.me/+cgrvXV-BbBJmMzYy";

export function HeroSection({ ascii }: { ascii: string }) {
  const { t } = useLanguage();
  const [replay, setReplay] = useState(0);

  const replayMark = () => setReplay((n) => n + 1);

  return (
    <section className="relative isolate flex min-h-[45vh] items-center overflow-hidden pt-24 pb-14 md:pt-28 md:pb-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, color-mix(in srgb, var(--on-bg-low), transparent 76%) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          maskImage:
            "radial-gradient(ellipse 90% 80% at 55% 45%, black 20%, transparent 82%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 90% 80% at 55% 45%, black 20%, transparent 82%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-16%] top-1/2 h-[55vh] w-[55vh] -translate-y-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--on-bg-high), transparent 94%), transparent 68%)",
        }}
      />

      <Container className="relative z-10 flex flex-col items-start gap-10 lg:flex-row lg:items-center lg:gap-16">
        <div className="flex w-full flex-1 flex-col items-start">
          <h1 className="animate-reveal fill-mode-both text-display-2 md:text-display-1">
            <span className="block">{t("vershiny.hero_title_1")}</span>
            <span className="block">{t("vershiny.hero_title_2")}</span>
          </h1>

          <p className="mt-6 max-w-md animate-reveal fill-mode-both text-body-2 leading-relaxed text-(--on-bg-medium) [animation-delay:150ms] md:mt-7 md:max-w-lg md:text-body-1">
            {t("vershiny.hero_subtitle")}
          </p>

          <div className="mt-8 animate-reveal fill-mode-both [animation-delay:280ms] md:mt-9">
            <Button size="xlarge" asChild>
              <Link href={JOIN_URL} target="_blank" rel="noopener noreferrer">
                <VershinyLogoIcon className="block lg:hidden" />
                {t("vershiny.hero_cta")}
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex w-full flex-1 animate-reveal items-center justify-center fill-mode-both [animation-delay:220ms]">
          <div className="relative w-full max-w-[420px]">
            <button
              type="button"
              onClick={replayMark}
              aria-label={t("vershiny.hero_replay")}
              title={t("vershiny.hero_replay")}
              className="group relative block w-full cursor-pointer rounded-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary)/40 focus-visible:ring-offset-8 focus-visible:ring-offset-(--bg)"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 scale-[0.9] rounded-full opacity-60 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background:
                    "radial-gradient(circle, color-mix(in srgb, var(--on-bg-high), transparent 90%), transparent 70%)",
                }}
              />
              <AsciiLifeLogo
                ascii={ascii}
                replayKey={replay}
                className="text-(--on-bg-high)"
              />
            </button>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default HeroSection;
