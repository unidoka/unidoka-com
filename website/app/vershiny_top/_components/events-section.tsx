"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarBlank,
  CalendarX,
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

export function EventsSection() {
  const { t, lang } = useLanguage();
  const [events, setEvents] = useState<EventListItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchPublishedEventsClient()
      .then((list) => {
        if (!cancelled) setEvents(list.slice(0, 3));
      })
      .catch(() => {
        if (!cancelled) setEvents([]);
      });
    return () => {
      cancelled = true;
    };
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
    if (s.toDateString() === e.toDateString()) return fmt(s);
    return `${fmt(s)} — ${fmt(e)}`;
  };

  return (
    <section className="py-16 md:py-24">
      <Container >
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <h2 className="text-display-3 leading-[1.05]! md:text-display-2">
            {t("vershiny.events_title")}
          </h2>
          <Button variant="outlined" size="medium" asChild>
            <Link href="/events">
              {t("vershiny.events_all")}
              <ArrowRight />
            </Link>
          </Button>
        </div>

        {events === null ? (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.15fr_1fr]">
            <Card className="h-[380px] animate-pulse rounded-3xl border-(--outline) bg-muted/30 ring-0" />
            <div className="flex flex-col gap-4">
              {[...Array(2)].map((_, i) => (
                <Card
                  key={i}
                  className="h-28 animate-pulse rounded-3xl border-(--outline) bg-muted/30 ring-0"
                />
              ))}
            </div>
          </div>
        ) : events.length === 0 ? (
          <Card className="rounded-3xl border border-dashed border-(--outline) bg-(--card) p-14 text-center ring-0">
            <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-(--primary-card) text-(--primary)">
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
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.15fr_1fr]">
            {featured && (
              /* The section is flush with the page now, so the featured
                 card carries its own surface instead of borrowing one. */
              <Card className="relative flex min-h-[380px] flex-col justify-between gap-8 overflow-hidden rounded-3xl border border-(--outline) bg-(--card) p-8 ring-0 md:p-10">
                <svg
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-40 w-full opacity-[0.08]"
                  viewBox="0 0 400 160"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 160 L80 60 L160 110 L240 30 L320 90 L400 20 L400 160 Z"
                    fill="var(--on-bg-high)"
                  />
                </svg>

                <div className="relative">
                  <Badge
                    variant="tonal-static"
                    size="chip-small"
                    className="mb-5 w-fit"
                  >
                    {eventTag(featured, defaultTag)}
                  </Badge>
                  <h3 className="text-display-4 leading-tight text-(--on-bg-high)">
                    {featured.title}
                  </h3>
                  <p className="mt-4 flex items-center gap-2 text-body-3 text-(--on-bg-medium)">
                    <CalendarBlank className="size-4 shrink-0" />
                    {formatDate(featured.start_at, featured.end_at)}
                  </p>
                  {featured.short_description && (
                    <p className="mt-3 line-clamp-2 text-body-3 leading-relaxed text-(--on-bg-medium)">
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
                      href={eventUrl(featured)}
                      aria-label={t("vershiny.events_all")}
                    >
                      <ArrowRight />
                    </Link>
                  </Button>
                </div>
              </Card>
            )}

            <div className="flex flex-col justify-center divide-y divide-(--outline)">
              {rest.length === 0 ? (
                <p className="py-6 text-body-3 text-(--on-bg-low)">
                  {t("vershiny.events_more_none")}
                </p>
              ) : (
                rest.map((e) => (
                  <Link
                    key={e.id}
                    href={eventUrl(e)}
                    className="group flex items-start gap-5 py-6 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0 flex-1">
                      <Badge
                        variant="tonal-static"
                        size="chip-small"
                        className="mb-3"
                      >
                        {eventTag(e, defaultTag)}
                      </Badge>
                      <h3 className="text-heading-2 leading-tight text-(--on-bg-high)">
                        {e.title}
                      </h3>
                      <p className="mt-2 flex items-center gap-2 text-body-4 text-(--on-bg-medium)">
                        <CalendarBlank className="size-4 shrink-0" />
                        {formatDate(e.start_at, e.end_at)}
                      </p>
                    </div>
                    <ArrowUpRight className="mt-1 size-5 shrink-0 text-(--on-bg-low) transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                ))
              )}
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}

export default EventsSection;
