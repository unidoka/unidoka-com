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
    <section className="relative overflow-hidden bg-(--bg) text-(--on-bg-high)">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--on-bg-high) 1px, transparent 1px), linear-gradient(to bottom, var(--on-bg-high) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 20% 30%, black 30%, transparent 95%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 20% 30%, black 30%, transparent 95%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 45% 55% at 12% 15%, var(--primary-glass), transparent 65%)",
        }}
      />
      <Container className="relative pt-32 sm:pt-44 pb-24 sm:pb-32">
        <div className="max-w-[880px] animate-reveal">
          <p className="text-body-5 uppercase tracking-[0.32em] text-(--on-bg-low) mb-6">
            Rovno.dev · {new Date().getFullYear()}
          </p>
          <h1 className="font-heading font-semibold tracking-[-0.04em] leading-[0.92] text-[3.25rem] sm:text-[5rem] lg:text-[6.5rem] mb-8">
            {t("hero.title.part1")}{" "}
            <span className="text-(--primary)">{t("hero.title.part2")}</span>
          </h1>
          <p className="text-body-2 md:text-body-1 text-(--on-bg-medium) leading-relaxed max-w-[560px] mb-10">
            {t("hero.subtitle")}
          </p>
          <div className="flex flex-wrap gap-3">
            <ConsultDialog>
              <Button size="large" shape="round">
                <LightbulbIcon className="size-4" />
                {t("nav.request")}
              </Button>
            </ConsultDialog>
            <Button size="large" variant="outlined" shape="round" asChild>
              <Link href={ROUTES.projects.href}>
                {t("projects.title")}
                <ArrowUpRightIcon className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
