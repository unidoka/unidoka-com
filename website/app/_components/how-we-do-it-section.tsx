"use client";

import Link from "next/link";
import {
  ArrowUpRightIcon,
  CalendarBlankIcon,
  CubeIcon,
  GitBranchIcon,
  HandshakeIcon,
  HeartIcon,
  StackIcon,
} from "@phosphor-icons/react";
import { Container } from "@/components/ui/container";
import { DoodleBolt } from "@/components/icons";
import { useLanguage } from "@/providers/language-provider";
import { cn } from "@/lib/utils";
import VershinyLogoIcon from "@/components/icons/logotypes/vershiny-logo-icon";

const CARDS = [
  {
    icon: HeartIcon,
    titleKey: "home.card_solutions_title",
    descKey: "home.card_solutions_desc",
    btnKey: "home.card_solutions_btn",
    href: "/solutions",
  },
  {
    icon: VershinyLogoIcon,
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

export function HowWeDoItSection() {
  const { t } = useLanguage();

  return (
    <section className="py-16 md:py-24">
      <Container>
        <h2 className="relative mb-10 text-display-3 leading-[1.05]! md:text-display-2">
          {t("home.numbers_title")}
        </h2>

        <div className="">
          {CARDS.map((c) => {
            const Icon = c.icon;
            const external = c.href.startsWith("http");
            const body = (
              <>
                <span className="flex size-12 shrink-0 items-center justify-center rounded-none bg-(--on-bg-high) text-(--bg) transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-[-3deg]">
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
              "group relative grid grid-cols-[48px_1fr] items-start gap-x-4 gap-y-3 transition-colors duration-300 hover:bg-[color-mix(in_srgb,var(--card)_60%,transparent)] md:grid-cols-[48px_1fr_auto] md:items-center md:gap-8 py-8";

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

export default HowWeDoItSection;
