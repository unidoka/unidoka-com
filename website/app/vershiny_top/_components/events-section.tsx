"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarBlank,
  CalendarX,
  MapPin,
} from "@phosphor-icons/react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  fetchPublishedEventsClient,
  eventUrl,
  type EventListItem,
} from "@/utils/api/events";
import { useLanguage } from "@/providers/language-provider";

function eventTag(ev: EventListItem, fallback: string): string {
  const tt = ev.types?.[0];
  if (tt?.type?.name) return tt.type.name;
  if (tt?.custom_name) return tt.custom_name;
  return ev.organizer?.name ?? fallback;
}

const stripHtml = (value: string) =>
  value.replace(/<[^>]*>?/gm, " ").replace(/\s+/g, " ").trim();

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export function EventsSection() {
  const { t, lang } = useLanguage();
  const [events, setEvents] = useState<EventListItem[] | null>(null);
  const locale = lang === "en" ? "en" : "ru";
  const withLocale = (path: string) => (lang === "en" ? `/en${path}` : path);

  useEffect(() => {
    let cancelled = false;
    fetchPublishedEventsClient(locale)
      .then((list) => {
        if (cancelled) return;
        const now = Date.now() - 86400000;
        const upcoming = list
          .filter((e) => {
            const raw = e.end_at || e.start_at;
            if (!raw) return true;
            const at = new Date(raw).getTime();
            return Number.isNaN(at) || at >= now;
          })
          .sort((a, b) => {
            const at = a.start_at ? new Date(a.start_at).getTime() : Infinity;
            const bt = b.start_at ? new Date(b.start_at).getTime() : Infinity;
            return at - bt;
          })
          .slice(0, 3);
        setEvents(upcoming);
      })
      .catch(() => {
        if (!cancelled) setEvents([]);
      });
    return () => {
      cancelled = true;
    };
  }, [locale]);

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
    if (s.toDateString() === e.toDateString()) return fmt(s);
    return `${fmt(s)} - ${fmt(e)}`;
  };

  return (
    <section className="py-16 md:py-24">
      <Container>
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <h2 className="text-display-3 leading-[1.05]! md:text-display-2">
            {t("vershiny.events_title")}
          </h2>
          <Button variant="outlined" size="medium" asChild>
            <Link href={withLocale("/events")}>
              {t("vershiny.events_all")}
              <ArrowRight />
            </Link>
          </Button>
        </div>

        {events === null ? (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.15fr_1fr]">
            <div className="skeleton-shimmer h-[400px] rounded-none" />
            <div className="flex flex-col gap-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="skeleton-shimmer h-32 rounded-none" />
              ))}
            </div>
          </div>
        ) : events.length === 0 ? (
          <Card className="rounded-none border border-dashed border-(--outline) bg-(--card) p-14 text-center ring-0">
            <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-none bg-(--primary-card) text-(--primary)">
              <CalendarX className="size-6" />
            </div>
            <h3 className="mb-2 text-heading-2">
              {t("vershiny.events_none_title")}
            </h3>
            <p className="mx-auto max-w-md text-body-3 leading-relaxed text-(--on-bg-medium)">
              {t("vershiny.events_none_body")}
            </p>
          </Card>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            className="grid grid-cols-1 gap-6 lg:grid-cols-[1.15fr_1fr]"
          >
            {featured && (
              <motion.article
                variants={item}
                className="group relative flex min-h-[400px] flex-col justify-between gap-10 overflow-hidden rounded-none border border-(--outline) bg-(--card) p-8 transition-colors duration-500 hover:border-(--on-bg-low) md:p-10"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-(--primary-glass) blur-3xl transition-opacity duration-500 group-hover:opacity-80 opacity-60"
                />
                <div className="relative">
                  <Badge variant="glass-static" size="chip-small" className="mb-5 w-fit">
                    {eventTag(featured, defaultTag)}
                  </Badge>
                  <h3 className="text-display-4 leading-tight text-(--on-bg-high)">
                    {stripHtml(featured.title)}
                  </h3>
                  <div className="mt-5 flex flex-col gap-2 text-body-4 text-(--on-bg-medium)">
                    <p className="flex items-center gap-2">
                      <CalendarBlank className="size-4 shrink-0" />
                      {formatDate(featured.start_at, featured.end_at)}
                    </p>
                    {featured.location_name && (
                      <p className="flex items-center gap-2">
                        <MapPin className="size-4 shrink-0" />
                        <span className="truncate">{stripHtml(featured.location_name)}</span>
                      </p>
                    )}
                  </div>
                  {featured.short_description && (
                    <p className="mt-4 line-clamp-2 text-body-3 leading-relaxed text-(--on-bg-medium)">
                      {stripHtml(featured.short_description)}
                    </p>
                  )}
                </div>

                <div className="relative flex items-end justify-between gap-4">
                  {featured.price ? (
                    <div className="text-display-4 leading-none text-(--on-bg-high)">
                      {featured.price}
                    </div>
                  ) : (
                    <div />
                  )}
                  <Button variant="glass" size="icon-large" asChild>
                    <Link
                      href={withLocale(eventUrl(featured))}
                      aria-label={t("vershiny.events_all")}
                    >
                      <ArrowRight />
                    </Link>
                  </Button>
                </div>
              </motion.article>
            )}

            <div className="flex flex-col gap-4">
              {rest.length === 0 ? (
                <p className="py-6 text-body-3 text-(--on-bg-low)">
                  {t("vershiny.events_more_none")}
                </p>
              ) : (
                rest.map((e) => (
                  <motion.div key={e.id} variants={item}>
                    <Link
                      href={withLocale(eventUrl(e))}
                      className="group flex items-start gap-5 rounded-none border border-(--outline) bg-(--card) p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-(--on-bg-low) hover:shadow-[0_12px_30px_-22px_rgba(0,0,0,0.45)]"
                    >
                      <div className="min-w-0 flex-1">
                        <Badge
                          variant="glass-static"
                          size="chip-small"
                          className="mb-3"
                        >
                          {eventTag(e, defaultTag)}
                        </Badge>
                        <h3 className="text-heading-2 leading-tight text-(--on-bg-high)">
                          {stripHtml(e.title)}
                        </h3>
                        <p className="mt-2 flex items-center gap-2 text-body-4 text-(--on-bg-medium)">
                          <CalendarBlank className="size-4 shrink-0" />
                          {formatDate(e.start_at, e.end_at)}
                        </p>
                        {e.location_name && (
                          <p className="mt-1.5 flex items-center gap-2 text-body-4 text-(--on-bg-low)">
                            <MapPin className="size-4 shrink-0" />
                            <span className="truncate">{stripHtml(e.location_name)}</span>
                          </p>
                        )}
                      </div>
                      <ArrowUpRight className="mt-1 size-5 shrink-0 text-(--on-bg-low) transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </Link>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </Container>
    </section>
  );
}

export default EventsSection;
