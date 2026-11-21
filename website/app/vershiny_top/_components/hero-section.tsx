"use client";

import { useState } from "react";
import { VershinyLogoMono } from "@/components/icons/logotypes/vershiny-logo-mono";
import { VershinyLogoIcon } from "@/components/icons/logotypes/vershiny-logo-icon";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { useLanguage } from "@/providers/language-provider";
import Link from "next/link";

const JOIN_URL = "https://t.me/+cgrvXV-BbBJmMzYy";

export function HeroSection() {
  const { t } = useLanguage();
  const [replay] = useState(0);

  return (
    <section className="relative flex min-h-[45vh] items-center overflow-hidden pt-24 pb-14 md:pt-28 md:pb-16">
      <Container
        className="flex flex-col items-start gap-10 lg:flex-row lg:items-center lg:gap-16"
      >
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

        <div className="relative hidden w-full flex-1 items-center justify-center lg:flex">
          <div
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-1/2 size-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-(--primary-glass) blur-3xl"
          />
          <VershinyLogoIcon
            replayKey={replay}
            className="relative h-56 w-auto text-(--on-bg-high) xl:h-64"
          />
        </div>
      </Container>
    </section>
  );
}

export default HeroSection;
