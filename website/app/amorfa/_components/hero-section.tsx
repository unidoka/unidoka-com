"use client";

import { GitBranchIcon, ArrowUpRightIcon } from "@phosphor-icons/react";
import { AnimatedAmorfaLogo } from "@/components/icons/logotypes/animated-amorfa-logo";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { useLanguage } from "@/providers/language-provider";

const GITHUB = "https://github.com/unidoka/amorfa";

/**
 * No divider, no panel: the hero sits directly on the page canvas and
 * hands over to the next block on whitespace alone. Height is a floor,
 * not a viewport claim — the copy sets it.
 */
export function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="relative flex min-h-[45vh] items-center overflow-hidden pt-24 pb-14 md:pt-28 md:pb-16">
      <Container

        className="flex flex-col items-center gap-10 lg:flex-row lg:gap-16"
      >
        <div className="flex w-full flex-1 flex-col items-start gap-8 md:gap-9">
          <h1 className="animate-reveal fill-mode-both text-display-2 leading-[1.02]! tracking-tight text-(--on-bg-high) md:text-display-1">
            <span className="flex items-center gap-[0.35em]">
              <AnimatedAmorfaLogo className="size-[1.05em] shrink-0 lg:hidden" />
              <span>{t("amorfa.hero_title_1")}</span>
            </span>
            <span className="block text-(--on-bg-medium)">
              {t("amorfa.hero_title_2")}
            </span>
          </h1>

          <div className="animate-reveal fill-mode-both [animation-delay:180ms]">
            <Button size="large" asChild>
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
            className="pointer-events-none absolute top-1/2 left-1/2 size-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-(--primary-glass) blur-3xl"
          />
          <AnimatedAmorfaLogo className="relative size-36 xl:size-44" />
        </div>
      </Container>
    </section>
  );
}

export default HeroSection;
