"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpRightIcon,
  StackIcon,
  GitBranchIcon,
  CubeIcon,
  CalendarBlankIcon,
} from "@phosphor-icons/react";
import { useLanguage } from "@/providers/language-provider";

const REPO_URL = "https://github.com/unidoka/unidoka-com";
const AMORFA_URL = "https://github.com/unidoka/amorfa";

interface SolutionItem {
  id: string;
  titleKey: string;
  descKey: string;
  href: string;
  external?: boolean;
  Icon: React.ComponentType<{ className?: string; weight?: "bold" | "regular" }>;
  tag: string;
}

const ITEMS: SolutionItem[] = [
  {
    id: "all",
    titleKey: "solutions.item_all_title",
    descKey: "solutions.item_all_desc",
    href: "/services",
    Icon: StackIcon,
    tag: "Services",
  },
  {
    id: "open_source",
    titleKey: "solutions.item_oss_title",
    descKey: "solutions.item_oss_desc",
    href: REPO_URL,
    external: true,
    Icon: GitBranchIcon,
    tag: "Open source",
  },
  {
    id: "amorfa",
    titleKey: "solutions.item_amorfa_title",
    descKey: "solutions.item_amorfa_desc",
    href: "/amorfa",
    Icon: CubeIcon,
    tag: "Framework",
  },
  {
    id: "events",
    titleKey: "solutions.item_events_title",
    descKey: "solutions.item_events_desc",
    href: "/events",
    Icon: CalendarBlankIcon,
    tag: "Community",
  },
];

function SolutionsInner() {
  const { t } = useLanguage();
  const params = useSearchParams();
  const filter = params.get("type");

  const matches = ITEMS.filter((i) => i.id === filter);
  const list = matches.length > 0 ? matches : ITEMS;

  return (
    <main className="min-h-screen bg-(--bg)">
      <section className="border-b border-(--outline) pt-32 md:pt-44 pb-16 md:pb-20">
        <Container>
          <div className="max-w-[900px] animate-reveal">
            <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-(--on-bg-low) mb-6">
              Solutions
            </p>
            <h1 className="font-heading font-medium tracking-[-0.04em] leading-[0.95] text-[2.75rem] md:text-[4.5rem] mb-6 text-(--on-bg-high)">
              {filter === "open_source"
                ? t("solutions.hero_oss_title")
                : t("solutions.hero_title")}
            </h1>
            <p className="text-body-2 text-(--on-bg-medium) leading-relaxed max-w-[640px]">
              {filter === "open_source"
                ? t("solutions.hero_oss_subtitle")
                : t("solutions.hero_subtitle")}
            </p>
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {list.map((item) => {
              const Icon = item.Icon;
              const isExt = item.external;
              const body = (
                <Card className="h-full rounded-3xl border border-(--outline) bg-(--card) ring-0 p-7 flex flex-col gap-5 transition-all duration-300 hover:border-(--on-bg-high) hover:-translate-y-0.5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-(--on-bg-high) text-(--bg)">
                      <Icon className="size-5" weight="bold" />
                    </div>
                    <Badge variant="tonal-card-static" size="chip-small">
                      {item.tag}
                    </Badge>
                  </div>
                  <h2 className="text-heading-2 text-(--on-bg-high) leading-tight">
                    {t(item.titleKey)}
                  </h2>
                  <p className="text-body-3 text-(--on-bg-medium) leading-relaxed flex-1">
                    {t(item.descKey)}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-body-4 font-medium text-(--on-bg-high) mt-2">
                    {isExt ? t("solutions.open_repo") : t("solutions.open")}
                    <ArrowUpRightIcon className="size-3.5" />
                  </span>
                </Card>
              );
              return isExt ? (
                <a
                  key={item.id}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  {body}
                </a>
              ) : (
                <Link key={item.id} href={item.href} className="block">
                  {body}
                </Link>
              );
            })}
          </div>

          {/* Open source CTA - visible whenever the page is shown */}
          <div className="mt-16 rounded-3xl border border-(--outline) bg-(--card) p-8 md:p-10 flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
            <div className="flex-1 min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-(--on-bg-low) mb-3">
                Open source
              </p>
              <h2 className="text-heading-1 text-(--on-bg-high) mb-2">
                {t("solutions.oss_cta_title")}
              </h2>
              <p className="text-body-3 text-(--on-bg-medium) leading-relaxed max-w-[560px]">
                {t("solutions.oss_cta_body")}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Button size="large" shape="round" asChild>
                <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
                  <GitBranchIcon className="size-4" />
                  unidoka-com
                  <ArrowUpRightIcon className="size-4" />
                </a>
              </Button>
              <Button size="large" variant="outlined" shape="round" asChild>
                <a href={AMORFA_URL} target="_blank" rel="noopener noreferrer">
                  <CubeIcon className="size-4" />
                  amorfa
                  <ArrowUpRightIcon className="size-4" />
                </a>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}

export default function SolutionsPage() {
  return (
    <Suspense fallback={null}>
      <SolutionsInner />
    </Suspense>
  );
}
