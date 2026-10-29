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
  Briefcase,
  CalendarBlank,
  Code,
  Cpu,
  Palette,
  Sparkle,
} from "@phosphor-icons/react";
import {
  fetchPublishedEventsClient,
  eventUrl,
  type EventListItem,
} from "@/utils/api/events";
import { useLanguage } from "@/providers/language-provider";

/* ── External links ─────────────────────────────────────────────── */
const JOIN_URL = "https://t.me/+cgrvXV-BbBJmMzYy";
const CONTACT_URL = "https://t.me/niyaz_gimadiev";
const SOCIALS = [
  { label: "Telegram", href: "https://t.me/vershiny_top" },
  { label: "ВКонтакте", href: "https://vk.ru/vershiny_top" },
  { label: "Max", href: "https://max.ru/channel_vershiny_top" },
] as const;

/* ── Static data ────────────────────────────────────────────────── */
const WHY = [
  { n: "01", titleKey: "vershiny.why_1_title", bodyKey: "vershiny.why_1_body" },
  { n: "02", titleKey: "vershiny.why_2_title", bodyKey: "vershiny.why_2_body" },
  { n: "03", titleKey: "vershiny.why_3_title", bodyKey: "vershiny.why_3_body" },
] as const;

const MENTOR_POINTS = [
  "vershiny.mentors_point_1",
  "vershiny.mentors_point_2",
  "vershiny.mentors_point_3",
  "vershiny.mentors_point_4",
] as const;

const DIRECTIONS = [
  {
    icon: Code,
    titleKey: "vershiny.direction_software_title",
    bodyKey: "vershiny.direction_software_body",
  },
  {
    icon: Briefcase,
    titleKey: "vershiny.direction_business_title",
    bodyKey: "vershiny.direction_business_body",
  },
  {
    icon: Palette,
    titleKey: "vershiny.direction_design_title",
    bodyKey: "vershiny.direction_design_body",
  },
  {
    icon: Cpu,
    titleKey: "vershiny.direction_hardware_title",
    bodyKey: "vershiny.direction_hardware_body",
  },
] as const;

/* The logo animation lives on a light background (see
   public/videos/ver-logo-animation.webm). In light mode it is faintly
   visible on its own; in dark mode it needs a scrim of the page
   background so the light text stays readable. The gradient is
   heaviest at the top (badge / heading / subtitle) and slightly
   lighter at the bottom, so the animation reads through the footer
   of the hero. */
const BG_SCRIM =
  "linear-gradient(to bottom, " +
  "color-mix(in srgb, var(--bg) 88%, transparent) 0%, " +
  "color-mix(in srgb, var(--bg) 78%, transparent) 100%)";

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
          lg+ : two-column split — copy on the left, the logo animation
                in a white shell on the right. The shell is kept white
                because the .webm has a baked white background; a
                theme-coloured shell would show a seam in dark mode.
          <lg : the animation becomes the section background. A soft
                gradient scrim in the section bg colour keeps the copy
                readable while letting the animation read through.
          The video element is rendered twice — once per layout — with
          `display: none` hiding the inactive one, so only one decodes
          at any time. Same src, so the HTTP cache serves the second
          copy for free. */}
      <section className="relative overflow-hidden border-b border-(--outline)">
        {/* Mobile / tablet background video */}
        <div
          aria-hidden
          className="lg:hidden pointer-events-none absolute inset-0 overflow-hidden"
        >
          <video
            src="/videos/ver-logo-animation.webm"
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div
            className="absolute inset-0"
            style={{ background: BG_SCRIM }}
          />
        </div>

        {/* Desktop bloom */}
        <div
          aria-hidden
          className="hidden lg:block pointer-events-none absolute -top-40 left-1/4 h-[520px] w-[520px] rounded-full opacity-[0.10]"
          style={{
            background:
              "radial-gradient(circle, var(--primary) 0%, transparent 70%)",
          }}
        />

        <Container
          variant="full-width"
          className="relative py-28 md:py-32 lg:py-24"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-16 items-center">
            {/* Copy */}
            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full border border-(--outline) bg-(--card) px-3 py-1 text-body-6 uppercase tracking-[0.24em] text-(--on-bg-low) mb-6">
                <span className="size-1.5 rounded-full bg-(--primary)" />
                {t("vershiny.badge")}
              </span>

              <h1 className="text-display-2 md:text-display-1 leading-[1.05] tracking-tight">
                {t("vershiny.title_1")}
                <br />
                <span className="text-(--primary)">
                  {t("vershiny.title_2")}
                </span>
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
                <Button
                  size="large"
                  variant="outlined"
                  shape="round"
                  asChild
                >
                  <Link href="/amorfa">
                    {t("vershiny.cta_amorfa")}
                    <ArrowUpRight />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Desktop video (right column, lg+) */}
            <div className="hidden lg:block relative w-full">
              <div className="relative w-full">
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

      {/* ─── WHY ───────────────────────────────────────────────────────
          Editorial header (asymmetric two-column) + a hairline grid of
          three stat-like cells. The 1px gaps between cells read as
          schematic rules, not as UI borders — that's the point.
          Numbers `01 / 02 / 03` are printed in mono at wide tracking,
          so the eye reads them as sequence markers, not decoration. */}
      <section className="py-20 md:py-28 border-b border-(--outline)">
        <Container variant="full-width">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-8 lg:gap-16 items-end mb-14">
            <div>
              <p className="text-body-6 uppercase tracking-[0.32em] text-(--primary) mb-3">
                {t("vershiny.why_eyebrow")}
              </p>
              <h2 className="text-display-3 md:text-display-2 leading-[1.05]">
                {t("vershiny.why_title")}
              </h2>
            </div>
            <p className="text-body-2 text-(--on-bg-medium) leading-relaxed max-w-[520px] lg:pb-2">
              {t("vershiny.why_subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-(--outline) border border-(--outline) rounded-3xl overflow-hidden">
            {WHY.map((w) => (
              <div
                key={w.n}
                className="bg-(--bg) p-8 md:p-10 flex flex-col"
              >
                <span className="font-mono text-[10px] tracking-[0.28em] text-(--on-bg-low) mb-10 tabular-nums">
                  {w.n}
                </span>
                <h3 className="text-heading-2 leading-tight mb-3">
                  {t(w.titleKey)}
                </h3>
                <p className="text-body-4 text-(--on-bg-medium) leading-relaxed">
                  {t(w.bodyKey)}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ─── MENTORS ───────────────────────────────────────────────────
          Two-column editorial split: statement on the left, numbered
          list on the right. The list uses hairline dividers only — no
          boxes, no icons. Reads like a document, which is the point:
          this section is an argument, not a feature grid. */}
      <section className="py-20 md:py-28 bg-(--card) border-b border-(--outline)">
        <Container variant="full-width">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-20 items-start">
            <div>
              <p className="text-body-6 uppercase tracking-[0.32em] text-(--primary) mb-3">
                {t("vershiny.mentors_eyebrow")}
              </p>
              <h2 className="text-display-3 md:text-display-2 leading-[1.05] mb-6">
                {t("vershiny.mentors_title")}
              </h2>
              <p className="text-body-2 text-(--on-bg-medium) leading-relaxed max-w-[520px]">
                {t("vershiny.mentors_body")}
              </p>
            </div>

            <ul className="border-y border-(--outline) divide-y divide-(--outline)">
              {MENTOR_POINTS.map((key, i) => (
                <li
                  key={key}
                  className="flex items-baseline gap-4 py-4"
                >
                  <span className="font-mono text-[10px] tracking-[0.24em] text-(--on-bg-low) shrink-0 tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-body-3 text-(--on-bg-high) leading-snug">
                    {t(key)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/* ─── DIRECTIONS ────────────────────────────────────────────────
          Same hairline-grid logic as the WHY block, but with four
          cells. Each cell carries a mono index, an inverted icon tile,
          a title, and a one-line body. The tile uses --on-bg-high as
          fill and --bg as glyph colour — the same monochrome inversion
          the home-page numbers section uses. */}
      <section className="py-20 md:py-28 border-b border-(--outline)">
        <Container variant="full-width">
          <div className="max-w-2xl mb-14">
            <p className="text-body-6 uppercase tracking-[0.32em] text-(--primary) mb-3">
              {t("vershiny.directions_eyebrow")}
            </p>
            <h2 className="text-display-3 md:text-display-2 leading-[1.05] mb-4">
              {t("vershiny.directions_title")}
            </h2>
            <p className="text-body-3 text-(--on-bg-medium) leading-relaxed">
              {t("vershiny.directions_subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-(--outline) border border-(--outline) rounded-3xl overflow-hidden">
            {DIRECTIONS.map((d, i) => {
              const Icon = d.icon;
              return (
                <div
                  key={d.titleKey}
                  className="bg-(--bg) p-7 md:p-8 flex flex-col gap-5"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex size-11 items-center justify-center rounded-2xl bg-(--on-bg-high) text-(--bg)">
                      <Icon className="size-5" weight="bold" />
                    </span>
                    <span className="font-mono text-[10px] tracking-[0.24em] text-(--on-bg-low) tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="text-heading-3 leading-tight">
                    {t(d.titleKey)}
                  </h3>
                  <p className="text-body-4 text-(--on-bg-medium) leading-relaxed">
                    {t(d.bodyKey)}
                  </p>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ─── UPCOMING EVENTS ────────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-(--card) border-b border-(--outline)">
        <Container variant="full-width">
          <div className="flex items-end justify-between mb-10 gap-6 flex-wrap">
            <div className="max-w-2xl">
              <p className="text-body-6 uppercase tracking-[0.32em] text-(--primary) mb-3">
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
                        href={eventUrl(featured)}
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
                      href={eventUrl(e)}
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

      {/* ─── CTA ───────────────────────────────────────────────────────
          Two-column card: the argument on the left, the channels on the
          right. The join button is the primary action; the contact
          button is the softer alternative for people who want to talk
          before committing. Channels listed below are plain text +
          arrow — icons here would compete with the logo glyph in the
          background and clutter the block. */}
      <section className="py-24 md:py-32">
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

            <div className="relative grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-10 lg:gap-16">
              <div>
                <p className="text-body-6 uppercase tracking-[0.32em] text-(--on-bg-low) mb-6">
                  {t("vershiny.cta_badge")}
                </p>
                <h2 className="text-display-3 md:text-display-2 leading-[1.05] mb-5">
                  {t("vershiny.cta_title")}
                </h2>
                <p className="text-body-3 text-(--on-bg-medium) leading-relaxed max-w-[520px] mb-8">
                  {t("vershiny.cta_subtitle")}
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button size="large" shape="round" asChild>
                    <a href={JOIN_URL} target="_blank" rel="noopener noreferrer">
                      {t("vershiny.cta_join")}
                      <ArrowRight />
                    </a>
                  </Button>
                  <Button size="large" variant="outlined" shape="round" asChild>
                    <a
                      href={CONTACT_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t("vershiny.cta_contact")}
                      <ArrowUpRight />
                    </a>
                  </Button>
                </div>
              </div>

              <div className="flex flex-col lg:pt-14">
                <p className="text-body-6 uppercase tracking-[0.32em] text-(--on-bg-low) mb-2">
                  {t("vershiny.cta_socials_label")}
                </p>
                <ul>
                  {SOCIALS.map((s) => (
                    <li key={s.label}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-between gap-4 py-3.5 border-b border-(--outline) text-body-3 text-(--on-bg-high) hover:text-(--primary) transition-colors"
                      >
                        <span>{s.label}</span>
                        <ArrowUpRight className="size-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
