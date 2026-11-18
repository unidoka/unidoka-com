"use client";

import { GitBranchIcon, ArrowUpRightIcon } from "@phosphor-icons/react";
import { AnimatedAmorfaLogo } from "@/components/icons/logotypes/animated-amorfa-logo";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { useLanguage } from "@/providers/language-provider";

const GITHUB = "https://github.com/unidoka/amorfa";

export function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="relative flex min-h-[86vh] items-center overflow-hidden border-b border-(--outline) bg-(--bg) pt-28 pb-20 md:pt-36 md:pb-28">
      <Container
        variant="full-width"
        className="flex flex-col items-center gap-14 lg:flex-row lg:gap-20"
      >
        <div className="flex w-full flex-1 flex-col items-start gap-10 md:gap-12">
          <h1 className="animate-reveal fill-mode-both text-[2.5rem]  leading-[1.04] tracking-tight text-(--on-bg-high) [animation-delay:120ms] md:text-6xl md:leading-[1.02] lg:text-7xl">
            <span className="flex items-center gap-[0.35em]">
              <AnimatedAmorfaLogo className="size-[1.05em] shrink-0 lg:hidden" />
              <span>{t("amorfa.hero_title_1")}</span>
            </span>
            <span className="block text-(--on-bg-medium)">
              {t("amorfa.hero_title_2")}
            </span>
          </h1>

          <div className="animate-reveal fill-mode-both [animation-delay:280ms]">
            <Button
              size="large"

              asChild
              className="md:h-16 md:px-10 md:text-heading-3!"
            >
              <a href={GITHUB} target="_blank" rel="noopener noreferrer">
                <GitBranchIcon />
                {t("amorfa.cta_github")}
                <ArrowUpRightIcon />
              </a>
            </Button>
          </div>
        </div>

        <div className="relative hidden w-full flex-1 items-center justify-center lg:flex">
          <div
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-1/2 size-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-(--primary-glass) blur-3xl"
          />
          <AnimatedAmorfaLogo className="relative size-48 animate-reveal-slow fill-mode-both text-(--on-bg-high) [animation-delay:200ms] xl:size-56" />
        </div>
      </Container>
    </section>
  );
}

export default HeroSection;
