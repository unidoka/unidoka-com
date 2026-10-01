"use client";

import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/ui/container";

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen">
      <Container className="py-24">
        <div className="space-y-8">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-(--on-bg-medium)">
            {t("Home.eyebrow")}
          </p>
          
          <h1 className="text-display-1 md:text-display-1xl leading-[1.05] tracking-tight">
            {t("Home.headline")}
          </h1>
          
          <p className="text-body-1 text-(--on-bg-medium) max-w-2xl leading-relaxed">
            {t("Home.subhead")}
          </p>
          
          <div className="flex flex-wrap gap-4 pt-4">
            <Button size="large" asChild>
              <Link href="/contact">
                {t("Home.ctaPrimary")}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            
            <Button size="large" variant="outlined" asChild>
              <Link href="/projects">
                {t("Home.ctaSecondary")}
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    </main>
  );
}
