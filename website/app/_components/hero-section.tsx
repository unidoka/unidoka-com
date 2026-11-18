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
          {/* Type comes entirely from the display tokens — family, weight and
              size travel together, so no font-* classes appear here.
              Leading is tightened for a two-line hero. */}
          <h1 className="text-display-2 leading-[0.98]! tracking-tight text-(--on-bg-high) md:text-display-1 lg:text-display-0">
            <span className="block">{t("hero.title.part1")}</span>

            {/* The mark closes the phrase. The row's leading is 1 so its box
                is exactly one em — centring against that puts the mark on the
                word's optical centre instead of on a loose heading line box.
                0.9em sizes the rendered glyph to cap height, and no manual
                translate is needed. Full contrast while the word recedes. */}
            <span className="flex items-center gap-[0.28em] leading-none text-(--on-bg-medium)">
              <span>{t("hero.title.part2")}</span>
              <AnimatedLogoIcon
                replayKey={replay}
                className="size-[0.9em] shrink-0 text-(--on-bg-high) lg:hidden"
              />
            </span>
          </h1>

          <p className="mt-8 max-w-md animate-reveal fill-mode-both text-body-2 leading-relaxed text-(--on-bg-medium) [animation-delay:160ms] md:mt-10 md:max-w-lg md:text-body-1">
            {t("hero.subtitle")}
          </p>

          <div className="mt-10 flex animate-reveal fill-mode-both flex-wrap items-center gap-4 [animation-delay:280ms] md:mt-12 md:gap-5">
            <QuickOrderDialog serviceName="Консультация">
              <Button
                size="large"

                className="md:h-16 md:px-10 md:text-heading-3!"
              >
                {t("hero.order")}
              </Button>
            </QuickOrderDialog>
          </div>
        </div>

        {/* Desktop: the mark above the logotype, centred in the second half. */}
        <div className="relative hidden w-full flex-1 flex-col items-center justify-center gap-10 lg:flex">
          <div
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-1/2 size-[460px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-(--primary-glass) blur-3xl"
          />
          <AnimatedLogoIcon
            replayKey={replay}
            className="relative size-52 text-(--on-bg-high) xl:size-64"
          />
        </div>
      </Container>
    </section>
  );
}

export default HeroSection;
