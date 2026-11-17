"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRightIcon, ArrowUpRightIcon } from "@phosphor-icons/react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { QuickOrderDialog } from "@/components/ui/quick-order-dialog";
import { AnimatedLogo } from "@/components/layout/logo/animated-logo";
import { AnimatedLogoIcon } from "@/components/layout/logo/animated-logo-icon";
import { useLanguage } from "@/providers/language-provider";

export function HeroSection() {
  const { t } = useLanguage();
  const [replay, setReplay] = useState(0);

  return (
    <section className="relative flex min-h-[86vh] items-center overflow-hidden border-b border-(--outline) bg-(--bg) pt-28 pb-20 md:pt-36 md:pb-28">
      <Container
        variant="full-width"
        className="flex flex-col items-center gap-14 lg:flex-row lg:gap-20"
      >
        <div className="flex w-full flex-1 flex-col items-start">
          <h1 className="animate-reveal fill-mode-both text-[2.5rem] font-semibold leading-[1.04] tracking-tight text-(--on-bg-high) [animation-delay:120ms] md:text-6xl md:leading-[1.02] lg:text-7xl">
            <span className="flex items-center gap-[0.35em]">
              <AnimatedLogoIcon
                replayKey={replay}
                className="size-[1em] shrink-0 lg:hidden"
              />
              <span>{t("hero.title.part1")}</span>
            </span>
            <span className="block text-(--on-bg-medium)">
              {t("hero.title.part2")}
            </span>
          </h1>

          <p className="mt-7 max-w-md animate-reveal fill-mode-both text-lg leading-relaxed text-(--on-bg-medium) [animation-delay:240ms] md:mt-9 md:max-w-lg md:text-xl lg:text-2xl">
            {t("hero.subtitle")}
          </p>

          <div className="mt-9 flex animate-reveal fill-mode-both flex-wrap items-center gap-4 [animation-delay:360ms] md:mt-12 md:gap-5">
            <QuickOrderDialog serviceName="Консультация">
              <Button
                size="large"
                shape="round"
                className="md:h-16 md:px-10 md:text-heading-3!"
              >
                {t("hero.order")}
                <ArrowRightIcon />
              </Button>
            </QuickOrderDialog>
            <Button
              size="large"
              variant="outlined"
              shape="round"
              asChild
              className="md:h-16 md:px-10 md:text-heading-3!"
            >
              <Link href="/solutions">
                {t("home.card_solutions_btn")}
                <ArrowUpRightIcon />
              </Link>
            </Button>
            <button
              type="button"
              onClick={() => setReplay((n) => n + 1)}
              className="text-sm font-medium text-(--on-bg-low) transition-colors hover:text-(--on-bg-high) md:text-base"
            >
              {t("hero.replay")}
            </button>
          </div>
        </div>

        <div className="relative hidden w-full flex-1 flex-col items-center justify-center gap-10 lg:flex">
          <div
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-1/2 size-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-(--primary-glass) blur-3xl"
          />
          <AnimatedLogoIcon
            replayKey={replay}
            className="relative size-48 animate-reveal-slow fill-mode-both text-(--on-bg-high) [animation-delay:200ms] xl:size-56"
          />
          <AnimatedLogo
            replayKey={replay}
            className="relative h-9 animate-reveal-slow fill-mode-both text-(--on-bg-high) [animation-delay:320ms] md:h-10"
          />
        </div>
      </Container>
    </section>
  );
}

export default HeroSection;
