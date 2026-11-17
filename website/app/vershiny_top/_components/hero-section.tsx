"use client";

import { useState } from "react";
import { VershinyLogoMono } from "@/components/icons/logotypes/vershiny-logo-mono";
import { VershinyLogoIcon } from "@/components/icons/logotypes/vershiny-logo-icon";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/providers/language-provider";

const JOIN_URL = "https://t.me/+cgrvXV-BbBJmMzYy";

export function HeroSection() {
  const { t } = useLanguage();
  const [replay, setReplay] = useState(0);

  return (
    <section className="relative flex min-h-[82vh] items-center justify-center overflow-hidden border-b border-(--outline) bg-(--bg) px-4 pt-28 pb-16 md:pt-32">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-16 lg:flex-row lg:gap-8">
        <div className="flex w-full flex-1 flex-col items-start gap-6">
          <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight text-(--on-bg-high) lg:text-6xl">
            <VershinyLogoMono
              replayKey={replay}
              className="h-10 text-(--on-bg-high) lg:hidden"
            />
            {t("vershiny.hero_title_1")}
            <br />
            {t("vershiny.hero_title_2")}
          </h1>

          <p className="max-w-md text-lg leading-relaxed text-(--on-bg-medium)">
            {t("vershiny.hero_subtitle")}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <Button size="large" shape="round" asChild>
              <a href={JOIN_URL} target="_blank" rel="noopener noreferrer">
                {t("vershiny.hero_cta")}
              </a>
            </Button>
          </div>
        </div>

        {/* The mono logotype is a full lockup (icon + wordmark) — render it alone. */}
        <div className="relative hidden w-full flex-1 items-center lg:flex">
          <VershinyLogoMono
            replayKey={replay}
            className="relative w-auto h-[100px] text-(--on-bg-high) xl:w-[460px]"
          />
        </div>
      </div>
    </section>
  );
}
