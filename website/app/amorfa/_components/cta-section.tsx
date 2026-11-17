"use client";

import { GitBranchIcon, ArrowUpRightIcon } from "@phosphor-icons/react";
import { AnimatedAmorfaLogo } from "@/components/icons/logotypes/animated-amorfa-logo";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { useLanguage } from "@/providers/language-provider";

const GITHUB = "https://github.com/unidoka/amorfa";

export function CtaSection() {
  const { t } = useLanguage();

  return (
    <section className="py-24 md:py-32">
      <Container variant="full-width">
        <div className="rounded-3xl border border-(--outline) bg-(--card) px-8 py-16 text-center md:py-20">
          <AnimatedAmorfaLogo className="mx-auto mb-8 size-12 text-(--on-bg-high)" />
          <h2 className="mb-10 text-display-4 leading-[1.05] md:text-display-3">
            {t("amorfa.cta_title_1")}{" "}
            <span className="text-(--on-bg-medium)">
              {t("amorfa.cta_title_2")}
            </span>
          </h2>
          <Button size="large" shape="round" asChild>
            <a href={GITHUB} target="_blank" rel="noopener noreferrer">
              <GitBranchIcon />
              {t("amorfa.cta_github")}
              <ArrowUpRightIcon />
            </a>
          </Button>
        </div>
      </Container>
    </section>
  );
}
