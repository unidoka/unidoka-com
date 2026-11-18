"use client";

import Link from "next/link";
import { GitBranchIcon, ArrowUpRightIcon } from "@phosphor-icons/react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { TerminalStyledInline } from "@/components/layout/fancy/terminal-styled-inline";
import { useLanguage } from "@/providers/language-provider";

const GITHUB = "https://github.com/unidoka/amorfa";

const STEPS = [
  {
    titleKey: "amorfa.step_1_title",
    command:
      "git clone https://github.com/unidoka/amorfa && cd amorfa && cp .env.example .env",
  },
  {
    titleKey: "amorfa.step_2_title",
    command: "docker compose up -d --build",
  },
  {
    titleKey: "amorfa.step_3_title",
    command: "docker exec -it main-service alembic upgrade head",
  },
] as const;

export function QuickstartSection() {
  const { t } = useLanguage();

  return (
    <section
      id="quickstart"
      className="scroll-mt-28 border-b border-(--outline) bg-(--card) py-20 md:py-28"
    >
      <Container variant="full-width">
        <h2 className="mb-12 max-w-2xl text-display-3 leading-[1.05] md:text-display-2">
          {t("amorfa.quickstart_title")}
        </h2>

        <div className="">
          {STEPS.map((s) => (
            <div
              key={s.titleKey}
              className="grid grid-cols-1 items-center gap-4 py-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-10"
            >
              <h3 className="text-heading-3 leading-tight text-(--on-bg-medium)">
                {t(s.titleKey)}
              </h3>
              <div className="min-w-0 [&>div]:mb-0">
                <TerminalStyledInline command={s.command} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <Button size="large" shape="round" asChild>
            <a href={GITHUB} target="_blank" rel="noopener noreferrer">
              <GitBranchIcon />
              {t("amorfa.quickstart_cta")}
              <ArrowUpRightIcon />
            </a>
          </Button>
        </div>
      </Container>
    </section>
  );
}
