"use client";

import { useRef } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import {
  ArrowUpRightIcon,
  GitBranchIcon,
  StackIcon,
  CalendarBlankIcon,
  CubeIcon,
} from "@phosphor-icons/react";
import { useLanguage } from "@/providers/language-provider";
import { cn } from "@/lib/utils";

export default function NumbersSection() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);

  const cards = [
    {
      titleKey: "home.card_solutions_title",
      descKey: "home.card_solutions_desc",
      btnKey: "home.card_solutions_btn",
      href: "/solutions",
      Icon: StackIcon,
    },
    {
      titleKey: "home.card_opensource_title",
      descKey: "home.card_opensource_desc",
      btnKey: "home.card_opensource_btn",
      href: "/solutions?type=open_source",
      Icon: GitBranchIcon,
    },
    {
      titleKey: "home.card_community_title",
      descKey: "home.card_community_desc",
      btnKey: "home.card_community_btn",
      href: "/amorfa",
      Icon: CubeIcon,
    },
    {
      titleKey: "home.card_events_title",
      descKey: "home.card_events_desc",
      btnKey: "home.card_events_btn",
      href: "/events",
      Icon: CalendarBlankIcon,
    },
  ];

  return (
    <section ref={sectionRef} className="pt-20 sm:pt-28 pb-12 sm:pb-20">
      <Container>
        <div className="flex items-end justify-between gap-6 mb-12 sm:mb-16 pb-6 border-b border-(--outline)">
          <h2 className="font-heading font-medium tracking-[-0.03em] leading-[0.95] text-[2rem] sm:text-[3.5rem] text-(--on-bg-high) max-w-[720px]">
            {t("home.numbers_title")}
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-(--on-bg-low) shrink-0 pb-2">
            01 / 04
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-(--outline) border border-(--outline) rounded-3xl overflow-hidden">
          {cards.map((card, idx) => {
            const Icon = card.Icon;
            return (
              <Link
                key={idx}
                href={card.href}
                className={cn(
                  "group relative bg-(--card) p-6 sm:p-8 flex flex-col min-h-[320px]",
                  "transition-colors hover:bg-(--state-hover)",
                )}
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-(--on-bg-low) mb-6">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div className="flex size-11 items-center justify-center rounded-xl bg-(--on-bg-high) text-(--bg) mb-6">
                  <Icon className="size-5" weight="bold" />
                </div>
                <h3 className="text-heading-2 text-(--on-bg-high) mb-3 leading-tight">
                  {t(card.titleKey)}
                </h3>
                <p className="text-body-3 text-(--on-bg-medium) leading-relaxed mb-6 flex-1">
                  {t(card.descKey)}
                </p>
                <span className="inline-flex items-center gap-1.5 text-body-4 font-medium text-(--on-bg-high) border-t border-(--outline) pt-4 group-hover:gap-2.5 transition-all mt-auto">
                  {t(card.btnKey)}
                  <ArrowUpRightIcon className="size-3.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
