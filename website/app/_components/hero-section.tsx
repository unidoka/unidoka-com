"use client";

import { useState } from "react";
import Link from "next/link";
import { VershinyLogoMono } from "@/components/icons/logotypes/vershiny-logo-mono";
import { VershinyLogoIcon } from "@/components/icons/logotypes/vershiny-logo-icon";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  const [replay, setReplay] = useState(0);

  return (
    <section className="relative flex min-h-[80vh] items-center justify-center bg-(--bg) px-4 py-20">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-16 lg:flex-row lg:gap-8">
        {/* Left: copy + CTA */}
        <div className="flex w-full flex-1 flex-col items-start gap-6">
          <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-(--on-bg-high) lg:text-6xl">
            <span className="mb-6 flex flex-col lg:hidden">
              <span className="mb-2 flex items-center gap-3">
                <VershinyLogoIcon
                  replayKey={replay}
                  className="size-10 text-(--on-bg-high)"
                />
                <span className="text-2xl font-bold uppercase tracking-tighter">
                  Vershiny Top
                </span>
              </span>
            </span>
            Платформа для роста <br className="hidden lg:block" />
            в IT-сфере
          </h1>

          <p className="max-w-md text-lg leading-relaxed text-(--on-bg-medium)">
            Менторство, стажировки и реальные проекты для тех, кто хочет
            расти быстрее.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <Button size="large" shape="round" asChild>
              <Link href="/vershiny_top">Начать</Link>
            </Button>
            <button
              type="button"
              onClick={() => setReplay((n) => n + 1)}
              className="text-sm font-medium text-(--on-bg-low) transition-colors hover:text-(--on-bg-high)"
            >
              Смотреть анимацию
            </button>
          </div>
        </div>

        {/* Right: the mono lockup already includes the icon — one SVG */}
        <div className="hidden w-full flex-1 items-center justify-end lg:flex">
          <VershinyLogoMono
            replayKey={replay}
            className="h-auto w-[320px] text-(--on-bg-high) xl:w-[380px]"
          />
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
