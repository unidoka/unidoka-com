"use client";

import { useState } from "react";
import { VershinyLogoMono } from "@/components/icons/logotypes/vershiny-logo-mono";
import { VershinyLogoIcon } from "@/components/icons/logotypes/vershiny-logo-icon";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { useLanguage } from "@/providers/language-provider";

const JOIN_URL = "https://t.me/+cgrvXV-BbBJmMzYy";

export function HeroSection() {
  const { t } = useLanguage();
  const [replay] = useState(0);

  return (
    <section className="relative flex min-h-[86vh] items-center overflow-hidden border-b border-(--outline) bg-(--bg) pt-28 pb-20 md:pt-36 md:pb-28">
      <Container
        variant="full-width"
        className="flex flex-col items-start gap-14 lg:flex-row lg:items-center lg:gap-20"
      >
        <div className="flex w-full flex-1 flex-col items-start">
          {/* Lockup owns its own line. `block` is load-bearing: an SVG is
              inline by default and would otherwise sit inside the
              headline's text flow and wrap between words. */}
          <VershinyLogoMono
            replayKey={replay}
            className="mb-8 block h-11 w-auto text-(--on-bg-high) md:mb-10 md:h-16 lg:hidden"
          />

          <h1 className="animate-reveal fill-mode-both text-[2.5rem] font-semibold leading-[1.04] tracking-tight text-(--on-bg-high) [animation-delay:120ms] md:text-6xl md:leading-[1.02] lg:text-7xl">
            <span className="block">{t("vershiny.hero_title_1")}</span>
            <span className="block">{t("vershiny.hero_title_2")}</span>
          </h1>

          <p className="mt-7 max-w-md animate-reveal fill-mode-both text-lg leading-relaxed text-(--on-bg-medium) [animation-delay:240ms] md:mt-9 md:max-w-xl md:text-xl lg:text-2xl">
            {t("vershiny.hero_subtitle")}
          </p>

          <div className="mt-9 animate-reveal fill-mode-both [animation-delay:360ms] md:mt-12">
            <Button
              size="large"
              shape="round"
              asChild
              className="md:h-16 md:px-10 md:text-heading-3!"
            >
              <a href={JOIN_URL} target="_blank" rel="noopener noreferrer">
                {t("vershiny.hero_cta")}
              </a>
            </Button>
          </div>
        </div>

        {/* The mark appears here and nowhere else — never inline in text. */}
        <div className="relative hidden w-full flex-1 items-center justify-center lg:flex">
          <div
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-1/2 size-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-(--primary-glass) blur-3xl"
          />
          <VershinyLogoIcon
            replayKey={replay}
            className="relative h-80 w-auto animate-reveal-slow fill-mode-both text-(--on-bg-high) [animation-delay:200ms] xl:h-96"
          />
        </div>
      </Container>
    </section>
  );
}

export default HeroSection;
