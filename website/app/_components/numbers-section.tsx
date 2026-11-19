"use client";

import Link from "next/link";
import {
  ArrowUpRightIcon,
  CalendarBlankIcon,
  CubeIcon,
  GitBranchIcon,
  StackIcon,
} from "@phosphor-icons/react";
import { Container } from "@/components/ui/container";
import { MarkerUnderline, DoodleBolt } from "@/components/icons";
import { useLanguage } from "@/providers/language-provider";
import { cn } from "@/lib/utils";

const CARDS = [
  {
    icon: StackIcon,
    titleKey: "home.card_solutions_title",
    descKey: "home.card_solutions_desc",
    btnKey: "home.card_solutions_btn",
    href: "/solutions",
  },
  {
    icon: GitBranchIcon,
    titleKey: "home.card_opensource_title",
    descKey: "home.card_opensource_desc",
    btnKey: "home.card_opensource_btn",
    href: "https://github.com/unidoka",
  },
  {
    icon: CubeIcon,
    titleKey: "home.card_community_title",
    descKey: "home.card_community_desc",
    btnKey: "home.card_community_btn",
    href: "/amorfa",
  },
  {
    icon: CalendarBlankIcon,
    titleKey: "home.card_events_title",
    descKey: "home.card_events_desc",
    btnKey: "home.card_events_btn",
    href: "/events",
  },
] as const;

export function NumbersSection() {
  const { t } = useLanguage();

  return (
    <section className="py-16 md:py-24">
      <Container>
        <h2 className="relative mb-10 max-w-2xl text-display-3 leading-[1.05]! md:mb-14 md:text-display-2">
          <span className="relative inline-block">
            {t("home.numbers_title")}
            <MarkerUnderline
              bold
              className="absolute -bottom-3 left-0 h-4 w-[72%]"
            />
          </span>
          <DoodleBolt
            className="absolute -right-12 -top-7 hidden size-9 -rotate-6 md:block"
          />
        </h2>

        <div className="border-t border-(--outline)">
          {CARDS.map((c) => {
            const Icon = c.icon;
            const external = c.href.startsWith("http");
            const body = (
              <>
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-(--on-bg-high) text-(--bg) transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-[-3deg]">
                  <Icon className="size-5" weight="bold" />
                </span>

                <div className="min-w-0">
                  <h3 className="text-heading-2 leading-tight text-(--on-bg-high) md:text-heading-1">
                    {t(c.titleKey)}
                  </h3>
                  <p className="mt-2 max-w-2xl text-body-3 leading-relaxed text-(--on-bg-medium)">
                    {t(c.descKey)}
                  </p>
                </div>

                <span className="col-span-2 inline-flex items-center gap-1.5 text-body-4 text-(--on-bg-high) transition-all duration-300 group-hover:gap-2.5 md:col-auto md:justify-self-end">
                  {t(c.btnKey)}
                  <ArrowUpRightIcon className="size-3.5" />
                </span>
              </>
            );
            const cls =
              "group relative grid grid-cols-[48px_1fr] items-start gap-x-5 gap-y-4 border-b border-(--outline) py-7 transition-colors duration-300 hover:bg-[color-mix(in_srgb,var(--card)_60%,transparent)] md:grid-cols-[48px_1fr_auto] md:items-center md:gap-8 md:py-9";

            return external ? (
              <a
                key={c.titleKey}
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cls}
              >
                {body}
              </a>
            ) : (
              <Link key={c.titleKey} href={c.href} className={cn(cls)}>
                {body}
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

export default NumbersSection;
