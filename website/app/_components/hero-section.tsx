"use client";

import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/utils/constants/routes";
import { ArrowUpRightIcon, LightbulbIcon } from "@phosphor-icons/react";
import { useLanguage } from "@/providers/language-provider";
import { ConsultDialog } from "@/components/consult-dialog";

export default function HeroSection() {
  const { t } = useLanguage();
  return (
    <section className="relative overflow-hidden bg-(--bg) text-(--on-bg-high) border-b border-(--outline)">
      {/* Blueprint grid - very faint, masked to the top of the viewport */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.035] dark:opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--on-bg-high) 1px, transparent 1px), linear-gradient(to bottom, var(--on-bg-high) 1px, transparent 1px)",
          backgroundSize: "96px 96px",
          maskImage:
            "radial-gradient(ellipse 80% 55% at 50% 0%, black 20%, transparent 90%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 55% at 50% 0%, black 20%, transparent 90%)",
        }}
      />
      {/* Single soft bloom - monochrome */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 55% 40% at 50% 8%, color-mix(in srgb, var(--on-bg-high), transparent 92%), transparent 70%)",
        }}
      />

      <Container className="relative pt-40 sm:pt-56 pb-24 sm:pb-36">
        <div className="max-w-[1100px] mx-auto text-center animate-reveal">
          <h1 className="font-heading font-medium tracking-[-0.045em] leading-[0.88] text-[3.25rem] sm:text-[6rem] lg:text-[8.5rem] mb-10 text-balance">
            {t("hero.title.part1")}
            <br />
            <span className="text-(--on-bg-low)">
              {t("hero.title.part2")}
            </span>
          </h1>
          <p className="text-body-2 md:text-body-1 text-(--on-bg-medium) leading-relaxed max-w-[600px] mx-auto mb-12">
            {t("hero.subtitle")}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <ConsultDialog>
              <Button size="large" shape="round">
                <LightbulbIcon className="size-4" />
                {t("nav.request")}
              </Button>
            </ConsultDialog>
            <Button size="large" variant="outlined" shape="round" asChild>
              <Link href={ROUTES.solutions.href}>
                {t("nav.solutions")}
                <ArrowUpRightIcon className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
