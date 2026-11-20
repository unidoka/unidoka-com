"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRightIcon, ArrowUpRightIcon, LightbulbIcon } from "@phosphor-icons/react";
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
    <section className="relative flex min-h-[56vh] items-center overflow-hidden pt-24 pb-14 md:pt-28 md:pb-16">
      <Container

        className="flex flex-col items-center gap-10 lg:flex-row lg:gap-16"
      >
        <div className="flex w-full flex-1 flex-col items-start">
          <h1 className="animate-reveal fill-mode-both text-display-2 leading-[1.02]! tracking-tight text-(--on-bg-high) md:text-display-1">
            <span className="block">{t("hero.title.part1")}</span>
            <span className="flex items-center gap-[0.28em] leading-none text-(--on-bg-medium)">
              <span>{t("hero.title.part2")}</span>
              <AnimatedLogoIcon
                replayKey={replay}
                className="size-[0.9em] shrink-0 text-(--on-bg-high) lg:hidden"
              />
            </span>
          </h1>

          <p className="mt-6 max-w-md animate-reveal fill-mode-both text-body-2 leading-relaxed text-(--on-bg-medium) [animation-delay:150ms] md:mt-7 md:max-w-lg md:text-body-1">
            {t("hero.subtitle")}
          </p>

          <div className="mt-8 flex animate-reveal fill-mode-both flex-wrap items-center gap-4 [animation-delay:280ms] md:mt-9">
            <QuickOrderDialog serviceName="Консультация">
              <Button size="large" >
                {t("hero.order")}
              </Button>
            </QuickOrderDialog>
            {/* <Button size="large" variant="outlined" asChild>
              <Link href="/solutions">
                {t("home.card_solutions_btn")}
                <ArrowUpRightIcon />
              </Link>
            </Button> */}
          </div>
        </div>

        <div className="relative hidden w-full flex-1 flex-col items-center justify-center gap-8 lg:flex">
          <div
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-1/2 size-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-(--primary-glass) blur-3xl"
          />
          <AnimatedLogoIcon
            replayKey={replay}
            className="relative size-40 xl:size-70 text-(--on-bg-high)"
          />
        </div>
      </Container>
    </section>
  );
}

export default HeroSection;
