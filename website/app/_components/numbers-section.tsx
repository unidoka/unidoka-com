"use client";
import React, { useState, useEffect, useRef } from "react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowUpRightIcon } from "@phosphor-icons/react";
import { useLanguage } from "@/providers/language-provider";
function useHackerNumber(targetValue: string, active: boolean) {
  const [display, setDisplay] = useState(targetValue);
  useEffect(() => {
    if (!active) return;
    let iteration = 0;
    const chars = "0123456789";
    const original = targetValue;
    const interval = setInterval(() => {
      setDisplay(original.split("").map((char, idx) => {
        if (char === " " || char === "." || char === "," || char === "—") return char;
        if (idx < iteration) return original[idx];
        return chars[Math.floor(Math.random() * chars.length)];
      }).join(""));
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
function SpotlightCard({ children, color }: { children: React.ReactNode; color: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      ref.current?.style.setProperty("--spot-x", `${x}px`);
      ref.current?.style.setProperty("--spot-y", `${y}px`);
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
          background: `radial-gradient(circle at center, ${color} 0%, transparent 90%)`
        }}
      />
      <div className="relative z-10 flex flex-col flex-1">
        {children}
      </div>
    </div>
  );
}
function NumberDisplay({ value, color, active }: { value: string; color: string; active: boolean }) {
  const display = useHackerNumber(value, active);
  return (
    <h3 className="text-(--on-bg-medium) text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-(--on-bg-high) mb-3">
      {display}
    </h3>
  );
}
export default function NumbersSection() {
  const { t } = useLanguage();
  const { ref: sectionRef, inView } = useInView({ threshold: 0.1 });
  const stats = [
    {
      number: "4.5 года",
      description: t("home.stats_team_experience"),
      buttonText: t("home.stats_team_btn"),
      href: "/team",
      color: "#3b82f6",
    },
    {
      number: "42",
      description: t("home.stats_projects_done"),
      buttonText: t("home.stats_projects_btn"),
      href: "/projects",
      color: "#f59e0b",
    },
    {
      number: "18",
      description: t("home.stats_happy_clients"),
      buttonText: t("home.stats_clients_btn"),
      href: "/reviews",
      color: "#ec4899",
    },
    {
      number: "1 день",
      description: t("home.stats_spec_prep"),
      buttonText: t("home.stats_spec_btn"),
      href: "/order",
      color: "#a855f7",
    },
  ];
  return (
    <section ref={sectionRef} className="pt-12 sm:pt-18 pb-8 sm:pb-18">
      <Container>
        <h2 className="text-display-2 text-[2rem] sm:text-[3.5rem] mb-8 sm:mb-16 text-left sm:text-center">
          {t("home.numbers_title")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 [&>*:not(:first-child)]:pt-8 [&>*:not(:last-child)]:pb-8">
          {stats.map((stat, idx) => (
            <SpotlightCard key={idx} color={stat.color}>
              <NumberDisplay value={stat.number} color={stat.color} active={inView} />
              <p className="text-body-2 text-(--on-bg-medium) leading-relaxed mb-8 flex-1">
                {stat.description}
              </p>
              <Button
                variant="outlined"
                size="medium"
                className="w-full mt-auto"
                asChild
              >
                <Link href={stat.href}>
                  {stat.buttonText}
                  <ArrowUpRightIcon className="size-4" />
                </Link>
              </Button>
            </SpotlightCard>
          ))}
        </div>
      </Container>
    </section>
  );
}
