"use client";

import React, { useState, useEffect, useRef } from "react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowUpRightIcon,
  GitBranchIcon,
  StackIcon,
  CalendarBlankIcon,
  SparkleIcon,
} from "@phosphor-icons/react";
import { useLanguage } from "@/providers/language-provider";

/* Hacker-number animation — kept for a future stats variant. Currently
   unused, but the section is small enough that removing it would cost
   more than leaving it. */
function useHackerNumber(targetValue: string, active: boolean) {
  const [display, setDisplay] = useState(targetValue);
  useEffect(() => {
    if (!active) return;
    let iteration = 0;
    const chars = "0123456789";
    const original = targetValue;
    const interval = setInterval(() => {
      setDisplay(
        original
          .split("")
          .map((char, idx) => {
            if (" .,—".includes(char)) return char;
            if (idx < iteration) return original[idx];
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join(""),
      );
      iteration += 1;
      if (iteration > original.length) {
        clearInterval(interval);
        setDisplay(original);
      }
    }, 60);
    return () => clearInterval(interval);
  }, [targetValue, active]);
  return display;
}

function useInView<T extends HTMLElement>(options?: IntersectionObserverInit) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.disconnect();
      }
    }, options);
    observer.observe(el);
    return () => observer.disconnect();
  }, [options]);
  return { ref, inView };
}

function SpotlightCard({
  children,
  color,
}: {
  children: React.ReactNode;
  color: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (rect) {
      ref.current?.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
      ref.current?.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
    }
  };
  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className="group relative p-0 sm:p-8 lg:p-6 flex flex-col h-full border-(--outline) border-b last:border-b-0 md:border-b-0 md:last:border-b-0 lg:border-r lg:last:border-r-0 md:[&:nth-child(odd)]:border-r md:[&:nth-child(-n+2)]:border-b lg:border-b-0! transition-colors hover:bg-(--primary-glass)"
      style={{ "--spot-color": color } as React.CSSProperties}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at var(--spot-x, 50%) var(--spot-y, 50%), var(--spot-color) 0%, transparent 40%)`,
          mixBlendMode: "overlay",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-10"
        style={{
          background: `radial-gradient(circle at center, ${color} 0%, transparent 90%)`,
        }}
      />
      <div className="relative z-10 flex flex-col flex-1">{children}</div>
    </div>
  );
}

export default function NumbersSection() {
  const { t } = useLanguage();
  const { ref: sectionRef, inView } = useInView({ threshold: 0.1 });

  // Four cards that describe what Unidoka actually ships. Each has an
  // accent colour that drives the hover spotlight and the icon tile.
  const cards = [
    {
      titleKey: "home.card_solutions_title",
      descKey: "home.card_solutions_desc",
      btnKey: "home.card_solutions_btn",
      href: "/projects",
      color: "#3b82f6",
      Icon: StackIcon,
    },
    {
      titleKey: "home.card_opensource_title",
      descKey: "home.card_opensource_desc",
      btnKey: "home.card_opensource_btn",
      href: "/amorfa",
      color: "#a855f7",
      Icon: GitBranchIcon,
    },
    {
      titleKey: "home.card_community_title",
      descKey: "home.card_community_desc",
      btnKey: "home.card_community_btn",
      href: "/events",
      color: "#10b981",
      Icon: SparkleIcon,
    },
    {
      titleKey: "home.card_events_title",
      descKey: "home.card_events_desc",
      btnKey: "home.card_events_btn",
      href: "/events",
      color: "#f59e0b",
      Icon: CalendarBlankIcon,
    },
  ];

  return (
    <section ref={sectionRef} className="pt-12 sm:pt-18 pb-8 sm:pb-18">
      <Container>
        <h2 className="text-display-2 text-[2rem] sm:text-[3.5rem] mb-8 sm:mb-16 text-left sm:text-center">
          {t("home.numbers_title")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 [&>*:not(:first-child)]:pt-8 [&>*:not(:last-child)]:pb-8">
          {cards.map((card, idx) => {
            const Icon = card.Icon;
            return (
              <SpotlightCard key={idx} color={card.color}>
                <div className="flex size-12 items-center justify-center rounded-2xl bg-(--primary-card) text-(--primary) mb-5">
                  <Icon className="size-5" weight="bold" />
                </div>
                <h3 className="text-heading-2 text-(--on-bg-high) mb-3">
                  {t(card.titleKey)}
                </h3>
                <p className="text-body-3 text-(--on-bg-medium) leading-relaxed mb-8 flex-1">
                  {t(card.descKey)}
                </p>
                <Button
                  variant="outlined"
                  size="medium"
                  className="w-full mt-auto"
                  asChild
                >
                  <Link href={card.href}>
                    {t(card.btnKey)}
                    <ArrowUpRightIcon className="size-4" />
                  </Link>
                </Button>
              </SpotlightCard>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
