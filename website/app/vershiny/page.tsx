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

/**
 * Four pillars — community, AI, products, open source.
 * `external` items render as <a> with target="_blank"; internal ones
 * render as Next <Link>. Keeps GitHub out of the client router.
 */
const PILLARS = [
  {
    icon: Users,
    title: "Соединяем таланты",
    description: "Молодые специалисты в IT, дизайне и бизнесе.",
    href: "/events",
    cta: "События",
  },
  {
    icon: Cpu,
    title: "AI на слабом железе",
    description: "Искусственный интеллект без облаков и дорогих серверов.",
    href: "/amorfa",
    cta: "Amorfa",
  },
  {
    icon: Lightbulb,
    title: "Решения, которые решают",
    description: "Продукты и сервисы под реальные задачи.",
    href: "/projects",
    cta: "Проекты",
  },
  {
    icon: Code,
    title: "Открытый код",
    description: "Фреймворки и инструменты в открытом доступе.",
    href: "https://github.com/unidoka",
    cta: "GitHub",
    external: true,
  },
] as const;

function formatDateRange(start?: string | null, end?: string | null): string {
  if (!start) return "Дата уточняется";
  const s = new Date(start);
  if (isNaN(s.getTime())) return "Дата уточняется";
  const fmt = (d: Date) =>
    d.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  if (!end) return fmt(s);
  const e = new Date(end);
  if (isNaN(e.getTime())) return fmt(s);
  return `${fmt(s)} — ${fmt(e)}`;
}

function eventTag(ev: EventListItem): string {
  const t = ev.types?.[0];
  if (t?.type?.name) return t.type.name;
  if (t?.custom_name) return t.custom_name;
  return ev.organizer?.name ?? "Событие";
}

export default function VershinyPage() {
  const [events, setEvents] = useState<EventListItem[] | null>(null);

  useEffect(() => {
    fetchPublishedEventsClient()
      .then((list) => setEvents(list.slice(0, 3)))
      .catch(() => setEvents([]));
  }, []);

  const featured = events?.[0];
  const rest = events?.slice(1) ?? [];

  return (
    <div className="min-h-screen">
      {/* ─── HERO ──────────────────────────────────────────────────────
          Video on the right (white container so the animation's own
          white bg blends on both themes), minimal copy on the left.
          Single primary-tinted radial glow — no more conic orange. */}
      <section className="relative overflow-hidden border-b border-(--outline)">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/4 h-[520px] w-[520px] rounded-full opacity-[0.10]"
          style={{
            background:
              "radial-gradient(circle, var(--primary) 0%, transparent 70%)",
          }}
        />
        <Container variant="full-width" className="relative py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-16 items-center">
            {/* Copy */}
            <div>
              <Badge variant="glass-static">
                <Sparkle className="size-3" />
                Better together
              </Badge>
              <h1 className="text-display-2 md:text-display-1 mt-6 leading-[1.05] tracking-tight">
                Соединяем таланты,
                <br />
                <span className="text-(--primary)">AI и решения.</span>
              </h1>
              <p className="text-body-3 text-(--on-bg-medium) mt-6 max-w-lg leading-relaxed">
                Сообщество, где молодые специалисты растут, а искусственный
                интеллект работает там, где другие сдаются.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <Button size="large" shape="round" asChild>
                  <Link href="/events">
                    Смотреть события
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
                    Amorfa
                    <ArrowUpRight />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Video — white container so the animation renders cleanly
                in dark mode. Soft primary bloom behind it, no orange. */}
            <div className="relative flex items-center justify-center">
              <div className="relative w-full max-w-[520px]">
                <div
                  aria-hidden
                  className="absolute inset-0 rounded-[2rem] blur-2xl opacity-[0.20]"
                  style={{
                    background:
                      "radial-gradient(circle, var(--primary) 0%, transparent 70%)",
                  }}
                />
                <div className="relative rounded-[2rem] border border-(--outline) bg-white p-4 md:p-5 shadow-xl overflow-hidden">
                  <video
                    src="/videos/ver-logo-animation.webm"
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-auto rounded-[1.25rem]"
                  />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ─── PILLARS — four across, tighter copy ──────────────────── */}
      <section className="py-20 md:py-28">
        <Container variant="full-width">
          <div className="max-w-2xl mb-12">
            <p className="text-body-5 uppercase tracking-widest text-(--primary) mb-3">
              Что мы делаем
            </p>
            <h2 className="text-display-3">Четыре опоры Вершин</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PILLARS.map((p) => {
              const Icon = p.icon;
              const linkClass =
                "inline-flex items-center gap-1 text-body-4 text-(--primary) hover:gap-2 transition-all mt-2";
              return (
                <Card
                  key={p.title}
                  className="p-6 gap-4 flex flex-col transition-colors hover:border-(--primary)/40"
                >
                  <span className="flex size-10 items-center justify-center rounded-2xl bg-(--primary-glass) text-(--primary)">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="text-heading-3 leading-tight">{p.title}</h3>
                  <p className="text-body-4 text-(--on-bg-medium) flex-1">
                    {p.description}
                  </p>
                  {"external" in p && p.external ? (
                    <a
                      href={p.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={linkClass}
                    >
                      {p.cta}
                      <ArrowUpRight className="size-4" />
                    </a>
                  ) : (
                    <Link href={p.href} className={linkClass}>
                      {p.cta}
                      <ArrowUpRight className="size-4" />
                    </Link>
                  )}
                </Card>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ─── UPCOMING EVENTS — DB-backed ──────────────────────────── */}
      <section className="py-20 md:py-28 bg-(--card) border-y border-(--outline)">
        <Container variant="full-width">
          <div className="flex items-end justify-between mb-10 gap-6 flex-wrap">
            <div className="max-w-2xl">
              <p className="text-body-5 uppercase tracking-widest text-(--primary) mb-3">
                Что дальше
              </p>
              <h2 className="text-display-3">Ближайшие события</h2>
            </div>
            <Button variant="outlined" size="medium" shape="round" asChild>
              <Link href="/events">
                Все события
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
                Пока нет событий
              </p>
              <p className="text-body-5 text-(--on-bg-low)">
                События появятся здесь, как только будут опубликованы.
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
                        Главное событие
                      </span>
                    </div>
                    <Badge variant="tonal-static" className="w-fit mb-4">
                      {eventTag(featured)}
                    </Badge>
                    <h3 className="text-display-4 leading-tight">
                      {featured.title}
                    </h3>
                    <p className="text-body-5 text-(--on-bg-low) uppercase tracking-wider mt-4">
                      {formatDateRange(featured.start_at, featured.end_at)}
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
                          Стоимость
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
                        aria-label="Подробнее о событии"
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
                    Больше событий пока нет.
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
                          <Badge variant="tonal-static">{eventTag(e)}</Badge>
                        </div>
                        <h3 className="text-heading-3 leading-tight group-hover:text-(--primary) transition-colors">
                          {e.title}
                        </h3>
                        <p className="text-body-5 text-(--on-bg-low) uppercase tracking-wider mt-2">
                          {formatDateRange(e.start_at, e.end_at)}
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
              <Badge variant="glass-static">Better together</Badge>
              <h2 className="text-display-3 mt-6 leading-tight">
                Готов сделать шаг к своей вершине?
              </h2>
              <p className="text-body-3 text-(--on-bg-medium) mt-4">
                Участие бесплатно, опыт не нужен, возраст от 16 лет.
              </p>
              <div className="flex flex-wrap gap-3 mt-8">
                <Button size="large" variant="filled" shape="round" asChild>
                  <Link href="/events">
                    Присоединиться
                    <ArrowRight />
                  </Link>
                </Button>
                <Button
                  size="large"
                  variant="outlined"
                  shape="round"
                  asChild
                >
                  <a
                    href="https://events.unidoka.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    events.unidoka.com
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
