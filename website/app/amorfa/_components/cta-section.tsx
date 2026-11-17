"use client";

import Link from "next/link";
import { GitBranchIcon, ArrowUpRightIcon } from "@phosphor-icons/react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { AmorfaLogo } from "@/components/icons/logotypes/amorfa-logo";
import { useLanguage } from "@/providers/language-provider";

const GITHUB = "https://github.com/unidoka/amorfa";

export function CtaSection() {
  const { t } = useLanguage();

  return (
    <section className="py-24 md:py-32">
      <Container variant="full-width">
        <div className="relative overflow-hidden rounded-3xl border border-(--outline) bg-(--card) p-8 text-center md:p-14">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 left-1/2 size-72 -translate-x-1/2 rounded-full bg-(--primary-glass) blur-3xl"
          />
          <div className="relative">
            <AmorfaLogo className="mx-auto mb-6 size-14 text-(--on-bg-high)" />
            <h2 className="mb-4 text-display-3 leading-[1.05] md:text-display-2">
              {t("amorfa.cta_title_1")}
              <br />
              {t("amorfa.cta_title_2")}
            </h2>
            <p className="mx-auto mb-8 max-w-lg text-body-2 leading-relaxed text-(--on-bg-medium)">
              {t("amorfa.cta_body")}
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Button size="large" shape="round" asChild>
                <a href={GITHUB} target="_blank" rel="noopener noreferrer">
                  <GitBranchIcon />
                  github.com/unidoka/amorfa
                  <ArrowUpRightIcon />
                </a>
              </Button>
              <Button size="large" variant="outlined" shape="round" asChild>
                <Link href="/">{t("amorfa.cta_home")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
