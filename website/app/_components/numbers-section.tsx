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
import { useLanguage } from "@/providers/language-provider";

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
    <section className="border-b border-(--outline) py-20 md:py-28">
      <Container variant="full-width">
        <h2 className="mb-14 max-w-2xl text-display-3 leading-[1.05] md:text-display-2">
          {t("home.numbers_title")}
        </h2>

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-(--outline) bg-(--outline) sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((c) => {
            const Icon = c.icon;
            const external = c.href.startsWith("http");
            const body = (
              <>
                <span className="flex size-12 items-center justify-center rounded-2xl bg-(--on-bg-high) text-(--bg) transition-transform duration-300 group-hover:-translate-y-1">
                  <Icon className="size-5" weight="bold" />
                </span>
                <h3 className="text-heading-3 leading-tight text-(--on-bg-high)">
                  {t(c.titleKey)}
                </h3>
                <p className="text-body-3 leading-relaxed text-(--on-bg-medium)">
                  {t(c.descKey)}
                </p>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-body-4 font-medium text-(--on-bg-high) transition-opacity group-hover:opacity-70">
                  {t(c.btnKey)}
                  <ArrowUpRightIcon className="size-3.5" />
                </span>
              </>
            );
            const cls =
              "group flex flex-col gap-4 bg-(--bg) p-8 transition-colors duration-300 hover:bg-(--card)";
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
              <Link key={c.titleKey} href={c.href} className={cls}>
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
