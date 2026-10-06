"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VershinyLogo } from "@/components/icons/logotypes/vershiny-logo";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarBlank,
  Code,
  Cpu,
  Lightbulb,
  Sparkle,
  Users,
} from "@phosphor-icons/react";
import {
  fetchPublishedEventsClient,
  type EventListItem,
} from "@/utils/api/events";
import { useLanguage } from "@/providers/language-provider";

/* Icon + i18n key pairs. Resolved with t() at render time so the
   language switcher re-renders copy without a page reload. */
const PILLARS = [
  {
    icon: Users,
    titleKey: "vershiny.pillar_talents_title",
    descKey: "vershiny.pillar_talents_desc",
    ctaKey: "vershiny.pillar_talents_cta",
    href: "/events",
  },
  {
    icon: Cpu,
    titleKey: "vershiny.pillar_ai_title",
    descKey: "vershiny.pillar_ai_desc",
    ctaKey: "vershiny.pillar_ai_cta",
    href: "/amorfa",
  },
  {
    icon: Lightbulb,
    titleKey: "vershiny.pillar_solutions_title",
    descKey: "vershiny.pillar_solutions_desc",
    ctaKey: "vershiny.pillar_solutions_cta",
    href: "/projects",
  },
  {
    icon: Code,
    titleKey: "vershiny.pillar_oss_title",
    descKey: "vershiny.pillar_oss_desc",
    ctaKey: "vershiny.pillar_oss_cta",
    href: "https://github.com/unidoka",
    external: true,
  },
] as const;

function eventTag(ev: EventListItem, fallback: string): string {
  const tt = ev.types?.[0];
  if (tt?.type?.name) return tt.type.name;
  if (tt?.custom_name) return tt.custom_name;
  return ev.organizer?.name ?? fallback;
}

export default function VershinyPage() {
  const { t, lang } = useLanguage();
  const [events, setEvents] = useState<EventListItem[] | null>(null);

  useEffect(() => {
    fetchPublishedEventsClient()
      .then((list) => setEvents(list.slice(0, 3)))
      .catch(() => setEvents([]));
  }, []);

  const featured = events?.[0];
  const rest = events?.slice(1) ?? [];
  const tbd = t("vershiny.events_date_tbd");
  const defaultTag = t("vershiny.events_default_tag");
  const dateLocale = lang === "ru" ? "ru-RU" : "en-US";

  // Local helper — reads `lang` at call time so flipping the switcher
  // reformats every visible date without a memo dance.
  const formatDate = (
    start: string | null | undefined,
    end: string | null | undefined,
  ): string => {
    if (!start) return tbd;
    const s = new Date(start);
    if (isNaN(s.getTime())) return tbd;
    const fmt = (d: Date) =>
      d.toLocaleDateString(dateLocale, {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    if (!end) return fmt(s);
    const e = new Date(end);
    if (isNaN(e.getTime())) return fmt(s);
    return `${fmt(s)} — ${fmt(e)}`;
  };

  return (
    <div className="min-h-screen">
      {/* ─── HERO ──────────────────────────────────────────────────────
          Video on the right, copy on the left. The video container was
          previously capped at 520px with a heavy inner frame and shadow
          that read as a widget. Now: wider on desktop (up to 720px, but
          full-column via max-w-none on lg+), a soft primary bloom behind
          it for depth, and the video sits directly inside the rounded
          shell with no nested frame. The white shell is kept because the
          .webm has a baked white background — switching it to a theme
          colour would show a seam. */}
      <section className="relative overflow-hidden border-b border-(--outline)">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/4 h-[520px] w-[520px] rounded-full opacity-[0.10]"
          style={{
            background: "radial-gradient(circle, var(--primary) 0%, transparent 70%)",
          }}
        />
        <Container variant="full-width" className="relative py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-16 items-center">
            {/* Copy */}
            <div>
              <Badge variant="glass-static">
                <Sparkle className="size-3" />
                {t("vershiny.badge")}
              </Badge>
              <h1 className="text-display-2 md:text-display-1 mt-6 leading-[1.05] tracking-tight">
                {t("vershiny.title_1")}
                <br />
                <span className="text-(--primary)">{t("vershiny.title_2")}</span>
              </h1>
              <p className="text-body-3 text-(--on-bg-medium) mt-6 max-w-lg leading-relaxed">
                {t("vershiny.subtitle")}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <Button size="large" shape="round" asChild>
                  <Link href="/events">
                    {t("vershiny.cta_events")}
                    <ArrowRight />
                  </Link>
                </Button>
                <Button size="large" variant="outlined" shape="round" asChild>
                  <Link href="/amorfa">
                    {t("vershiny.cta_amorfa")}
                    <ArrowUpRight />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Video */}
            <div className="relative w-full">
              <div className="relative w-full max-w-[720px] mx-auto lg:max-w-none">
                <div
                  aria-hidden
                  className="absolute -inset-6 rounded-[2.5rem] blur-3xl opacity-[0.16]"
                  style={{
                    background:
                      "radial-gradient(circle, var(--primary) 0%, transparent 70%)",
                  }}
                />
                <div className="relative rounded-[1.75rem] border border-(--outline) bg-white overflow-hidden shadow-2xl">
                  <video
                    src="/videos/ver-logo-animation.webm"
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="block w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ─── PILLARS ──────────────────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <Container variant="full-width">
          <div className="max-w-2xl mb-12">
            <p className="text-body-5 uppercase tracking-widest text-(--primary) mb-3">
              {t("vershiny.pillars_eyebrow")}
            </p>
            <h2 className="text-display-3">{t("vershiny.pillars_title")}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PILLARS.map((p) => {
              const Icon = p.icon;
              const linkClass =
                "inline-flex items-center gap-1 text-body-4 text-(--primary) hover:gap-2 transition-all mt-2";
              return (
                <Card
                  key={p.titleKey}
                  className="p-6 gap-4 flex flex-col transition-colors hover:border-(--primary)/40"
                >
                  <span className="flex size-10 items-center justify-center rounded-2xl bg-(--primary-glass) text-(--primary)">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="text-heading-3 leading-tight">{t(p.titleKey)}</h3>
                  <p className="text-body-4 text-(--on-bg-medium) flex-1">
                    {t(p.descKey)}
                  </p>
                  {"external" in p && p.external ? (
                    <a
                      href={p.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={linkClass}
                    >
                      {t(p.ctaKey)}
                      <ArrowUpRight className="size-4" />
                    </a>
                  ) : (
                    <Link href={p.href} className={linkClass}>
                      {t(p.ctaKey)}
                      <ArrowUpRight className="size-4" />
                    </Link>
                  )}
                </Card>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ─── UPCOMING EVENTS ──────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-(--card) border-y border-(--outline)">
        <Container variant="full-width">
          <div className="flex items-end justify-between mb-10 gap-6 flex-wrap">
            <div className="max-w-2xl">
              <p className="text-body-5 uppercase tracking-widest text-(--primary) mb-3">
                {t("vershiny.events_eyebrow")}
              </p>
              <h2 className="text-display-3">{t("vershiny.events_title")}</h2>
            </div>
            <Button variant="outlined" size="medium" shape="round" asChild>
              <Link href="/events">
                {t("vershiny.events_all")}
                <ArrowRight />
              </Link>
            </Button>
          </div>
          {events === null ? (
            <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-8">
              <Card className="rounded-3xl border-(--outline) h-[360px] animate-pulse bg-muted/30" />
              <div className="flex flex-col gap-4">
                {[...Array(2)].map((_, i) => (
                  <Card
                    key={i}
                    className="rounded-3xl border-(--outline) h-24 animate-pulse bg-muted/30"
                  />
                ))}
              </div>
            </div>
          ) : events.length === 0 ? (
            <Card className="rounded-3xl border border-dashed border-(--outline) p-12 text-center">
              <CalendarBlank className="size-8 mx-auto text-(--on-bg-low) mb-4" />
              <p className="text-body-3 text-(--on-bg-medium) mb-1">
                {t("vershiny.events_none_title")}
              </p>
              <p className="text-body-5 text-(--on-bg-low)">
                {t("vershiny.events_none_body")}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-8">
              {featured && (
                <Card className="relative overflow-hidden p-8 md:p-10 gap-6 flex flex-col justify-between min-h-[360px]">
                  <svg
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-40 w-full opacity-[0.08]"
                    viewBox="0 0 400 160"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0 160 L80 60 L160 110 L240 30 L320 90 L400 20 L400 160 Z"
                      fill="var(--primary)"
                    />
                  </svg>
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkle className="size-4 text-(--primary)" />
                      <span className="text-body-5 uppercase tracking-widest text-(--on-bg-low)">
                        {t("vershiny.events_featured")}
                      </span>
                    </div>
                    <Badge variant="tonal-static" className="w-fit mb-4">
                      {eventTag(featured, defaultTag)}
                    </Badge>
                    <h3 className="text-display-4 leading-tight">
                      {featured.title}
                    </h3>
                    <p className="text-body-5 text-(--on-bg-low) uppercase tracking-wider mt-4">
                      {formatDate(featured.start_at, featured.end_at)}
                    </p>
                    {featured.short_description && (
                      <p className="text-body-4 text-(--on-bg-medium) mt-3 line-clamp-2">
                        {featured.short_description}
                      </p>
                    )}
                  </div>
                  <div className="relative flex items-end justify-between gap-4">
                    {featured.price ? (
                      <div>
                        <div className="text-body-5 uppercase tracking-widest text-(--on-bg-low)">
                          {t("vershiny.events_price_label")}
                        </div>
                        <div className="text-display-3 text-(--primary) leading-none mt-2">
                          {featured.price}
                        </div>
                      </div>
                    ) : (
                      <div />
                    )}
                    <Button
                      variant="glass"
                      size="icon-large"
                      shape="round"
                      asChild
                    >
                      <Link
                        href={`/events/${featured.slug}`}
                        aria-label={t("vershiny.events_all")}
                      >
                        <ArrowRight />
                      </Link>
                    </Button>
                  </div>
                </Card>
              )}
              <div className="flex flex-col divide-y divide-(--outline)">
                {rest.length === 0 ? (
                  <p className="text-body-4 text-(--on-bg-low) py-6">
                    {t("vershiny.events_more_none")}
                  </p>
                ) : (
                  rest.map((e, i) => (
                    <Link
                      key={e.id}
                      href={`/events/${e.slug}`}
                      className="group flex items-start gap-5 py-5 first:pt-0 last:pb-0"
                    >
                      <span className="text-display-4 text-(--on-bg-low) tabular-nums w-10 shrink-0">
                        {String(i + 2).padStart(2, "0")}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="tonal-static">
                            {eventTag(e, defaultTag)}
                          </Badge>
                        </div>
                        <h3 className="text-heading-3 leading-tight group-hover:text-(--primary) transition-colors">
                          {e.title}
                        </h3>
                        <p className="text-body-5 text-(--on-bg-low) uppercase tracking-wider mt-2">
                          {formatDate(e.start_at, e.end_at)}
                        </p>
                      </div>
                      <ArrowUpRight className="size-5 text-(--on-bg-low) group-hover:text-(--primary) transition-colors mt-1 shrink-0" />
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </Container>
      </section>

      {/* ─── CTA ────────────────────────────────────────────────────── */}
      <section className="py-24">
        <Container variant="full-width">
          <div className="relative overflow-hidden rounded-3xl border border-(--outline) bg-(--card) p-8 md:p-14">
            <VershinyLogo
              className="pointer-events-none absolute -right-8 -bottom-8 h-56 w-auto opacity-[0.06]"
              aria-hidden
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full opacity-[0.08]"
              style={{
                background:
                  "radial-gradient(circle, var(--primary) 0%, transparent 70%)",
              }}
            />
            <div className="relative max-w-2xl">
              <Badge variant="glass-static">{t("vershiny.cta_badge")}</Badge>
              <h2 className="text-display-3 mt-6 leading-tight">
                {t("vershiny.cta_title")}
              </h2>
              <p className="text-body-3 text-(--on-bg-medium) mt-4">
                {t("vershiny.cta_subtitle")}
              </p>
              <div className="flex flex-wrap gap-3 mt-8">
                <Button size="large" variant="filled" shape="round" asChild>
                  <Link href="/events">
                    {t("vershiny.cta_join")}
                    <ArrowRight />
                  </Link>
                </Button>
                <Button size="large" variant="outlined" shape="round" asChild>
                  <a
                    href="https://events.unidoka.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t("vershiny.cta_url")}
                    <ArrowUpRight />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
