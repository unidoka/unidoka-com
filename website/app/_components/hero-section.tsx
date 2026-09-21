"use client";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useHost } from "@/hooks/use-host";
import { useLanguage } from "@/providers/language-provider";

export default function HeroSection() {
  const { t } = useLanguage();
  const { urlFor } = useHost();

  return (
    <section className="relative overflow-hidden py-14 md:py-24 min-h-[70vh] flex items-center">
      <div className="absolute inset-0 pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none grid-bg" />
      <div className="z-10 absolute h-full w-full bottom-0 left-0 bg-gradient-to-t from-(--bg) to-(--bg)/0 to-20%" />
      <Container className="relative z-10 flex flex-col items-center text-center">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-semibold leading-[1.05] tracking-tight text-(--on-bg-high) mb-6">
          {t("Hero.titleLine1")} <br />
          <span className="text-(--on-bg-medium)">{t("Hero.titleLine2")}</span>
        </h1>
        <p className="text-body-1 md:text-body-0 text-(--on-bg-medium) max-w-2xl mx-auto mb-10 leading-relaxed">
          {t("Hero.subtitle")}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
          <Button size="large" shape="round" className="w-full sm:w-fit" asChild>
            <Link href="/order">{t("Hero.ctaPrimary")}</Link>
          </Button>
          <Button variant="glass" size="large" shape="round" className="w-full sm:w-fit" asChild>
            {/* Cross-subdomain: "See case studies" points at the events subdomain. */}
            <Link href={urlFor("events", "/")}>{t("Hero.ctaSecondary")}</Link>
          </Button>
        </div>
      </Container>
    </section>
  );
}
