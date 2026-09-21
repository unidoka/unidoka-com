"use client";

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
  Cpu,
  Lightbulb,
  Users,
  Mountains,
  Sparkle,
} from "@phosphor-icons/react";

// Statistically the events page's hero. Also serves as a "what is this"
// landing for anyone who lands on events.unidoka.com/vershiny cold.
const PILLARS = [
  {
    icon: Users,
    title: "Соединяем таланты",
    description:
      "Молодые специалисты в IT, дизайне и бизнесе. Конференции, форумы, стажировки и менторы из Rovno.dev и Юнидоки.",
    href: "/",
    cta: "Наши события",
  },
  {
    icon: Cpu,
    title: "AI на слабом железе",
    description:
      "Делаем искусственный интеллект, который работает на слабых устройствах. Без облаков и дорогих серверов.",
    href: "/#detectors",
    cta: "Смотреть технологии",
  },
  {
    icon: Lightbulb,
    title: "Решения, которые решают",
    description:
      "Разрабатываем продукты и сервисы, которые закрывают реальные задачи бизнеса и людей.",
    href: "/",
    cta: "К событиям",
  },
];

const HIGHLIGHTS = [
  { value: "40+", label: "молодых специалистов", note: "из разных городов России" },
  { value: "100+", label: "событий", note: "конференций, форумов, соревнований" },
  { value: "5+", label: "партнёров", note: "компаний и площадок для практики" },
  { value: "0 ₽", label: "стоимость участия", note: "опыт не нужен, от 16 лет" },
];

const UPCOMING = [
  {
    title: "Cortex Challenge 2026",
    date: "Сентябрь — Ноябрь 2026",
    tag: "BI · Аналитика",
    prize: "1 000 000 ₽",
  },
  {
    title: "RISC-V Конкурс 2026",
    date: "Август — Декабрь 2026",
    tag: "Hardware · MIK32",
    prize: "до 49 999 ₽",
  },
  {
    title: "Хакатон Московского Транспорта",
    date: "25 сентября — 3 октября 2026",
    tag: "Геймификация · ВСМ",
    prize: "500 000 ₽",
  },
];

export default function VershinyPage() {
  return (
    <div className="min-h-screen">
      {/* ============================================================
          HERO — logo-led, asymmetric. Left: giant VershinyLogo mark
          with a soft radial glow. Right: headline + CTA stack.
          No centered blob, no three-card default.
         ============================================================ */}
      <section className="relative overflow-hidden border-b border-(--outline)">
        {/* ambient gradient wash behind the logo */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full opacity-[0.14]"
          style={{
            background:
              "radial-gradient(circle, var(--primary) 0%, transparent 65%)",
          }}
        />

        <Container variant="full-width" className="relative py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-10 lg:gap-16 items-center">
            {/* Logo panel */}
            <div className="relative flex items-center justify-center">
              <div className="relative">
                {/* outer halo */}
                <div
                  aria-hidden
                  className="absolute inset-0 rounded-[2.5rem] blur-3xl opacity-40"
                  style={{
                    background:
                      "conic-gradient(from 180deg, var(--primary), #E8590C, var(--primary))",
                  }}
                />
                <div className="relative rounded-[2.5rem] border border-(--outline) bg-(--card) p-10 md:p-14 shadow-2xl">
                  <VershinyLogo className="h-32 md:h-44 w-auto" />
                  <p className="mt-6 text-body-4 uppercase tracking-[0.24em] text-(--on-bg-low) text-center">
                    Вершины
                  </p>
                </div>
              </div>
            </div>

            {/* Copy panel */}
            <div className="flex flex-col items-start">
              <Badge variant="glass-static">
                <Sparkle className="size-3" />
                Unidoka · Better together
              </Badge>

              <h1 className="text-display-2 md:text-display-1 mt-6 leading-[1.05] tracking-tight">
                Соединяем таланты, AI
                <br className="hidden md:block" />{" "}
                <span className="text-(--on-bg-medium)">
                  и решения, которые решают
                </span>
              </h1>

              <p className="text-body-2 text-(--on-bg-medium) mt-6 max-w-xl leading-relaxed">
                Unidoka — экосистема, в которой молодые специалисты растут, а
                искусственный интеллект работает там, где другие сдаются.
                Вместе мы делаем больше.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mt-8 w-full sm:w-auto">
                <Button variant="filled" size="large" shape="round" asChild>
                  <Link href="/">
                    Смотреть события
                    <ArrowRight />
                  </Link>
                </Button>
                <Button variant="outlined" size="large" shape="round" asChild>
                  <Link href="/#how">
                    <CalendarBlank />
                    Календарь событий
                  </Link>
                </Button>
              </div>

              {/* Inline mini-stats under the CTA — not a card row */}
              <dl className="mt-10 grid grid-cols-3 gap-6 w-full max-w-md pt-6 border-t border-(--outline)">
                {HIGHLIGHTS.slice(0, 3).map((h) => (
                  <div key={h.label} className="flex flex-col">
                    <dt className="text-display-4 text-(--primary) tabular-nums">
                      {h.value}
                    </dt>
                    <dd className="text-body-5 text-(--on-bg-low) leading-tight mt-1">
                      {h.label}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </Container>
      </section>

      {/* ============================================================
          PILLARS — three columns, but with a twist: the middle card
          is taller/offset so it reads as a physical "peak" between
          two lower shoulders. References the logo shape.
         ============================================================ */}
      <section className="py-20 md:py-28">
        <Container variant="full-width">
          <div className="max-w-2xl mb-12">
            <p className="text-body-5 uppercase tracking-widest text-(--primary) mb-3">
              Что мы делаем
            </p>
            <h2 className="text-display-3">Три опоры Вершин</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
            {PILLARS.map((p, i) => {
              const Icon = p.icon;
              // Middle column gets a small vertical offset on desktop so
              // the trio reads like a mountain silhouette rather than
              // three identical boxes.
              const lift = i === 1 ? "md:-translate-y-6" : "";
              return (
                <Card
                  key={p.title}
                  className={`p-6 gap-4 flex flex-col transition-transform ${lift} hover:-translate-y-1`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-2xl bg-(--primary-glass) text-(--primary)">
                      <Icon className="size-5" />
                    </span>
                    <h3 className="text-heading-3 leading-tight">{p.title}</h3>
                  </div>
                  <p className="text-body-4 text-(--on-bg-medium) flex-1">
                    {p.description}
                  </p>
                  <Link
                    href={p.href}
                    className="inline-flex items-center gap-1 text-body-4 text-(--primary) hover:gap-2 transition-all mt-2"
                  >
                    {p.cta}
                    <ArrowUpRight className="size-4" />
                  </Link>
                </Card>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ============================================================
          HIGHLIGHTS — full-bleed strip, no boxes. Left-aligned label
          and a horizontal numeric row. Airy, editorial, no cards.
         ============================================================ */}
      <section className="py-16 md:py-20 bg-(--card) border-y border-(--outline)">
        <Container variant="full-width">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="max-w-md">
              <p className="text-body-5 uppercase tracking-widest text-(--primary) mb-3">
                Результаты
              </p>
              <h2 className="text-display-3 leading-tight">
                Меньше слов.
                <br />
                Больше цифр.
              </h2>
            </div>

            <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-10 gap-y-8 flex-1 lg:max-w-3xl">
              {HIGHLIGHTS.map((h) => (
                <div key={h.label} className="flex flex-col">
                  <dt className="text-display-3 text-(--primary) tabular-nums">
                    {h.value}
                  </dt>
                  <dd className="mt-2">
                    <div className="text-heading-5">{h.label}</div>
                    <div className="text-body-5 text-(--on-bg-low) mt-1">
                      {h.note}
                    </div>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </Container>
      </section>

      {/* ============================================================
          UPCOMING — asymmetric. Left column is a numbered index list;
          right column is a featured card for the next major event.
          Not a 3-column card row.
         ============================================================ */}
      <section className="py-20 md:py-28">
        <Container variant="full-width">
          <div className="flex items-end justify-between mb-10 gap-6 flex-wrap">
            <div className="max-w-2xl">
              <p className="text-body-5 uppercase tracking-widest text-(--primary) mb-3">
                Что дальше
              </p>
              <h2 className="text-display-3">Ближайшие соревнования</h2>
            </div>
            <Button variant="outlined" size="medium" shape="round" asChild>
              <Link href="/">
                Все события
                <ArrowRight />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-8">
            {/* Featured — first item, big */}
            <FeaturedUpcoming event={UPCOMING[0]} />

            {/* Index list — remaining items, dense but readable */}
            <div className="flex flex-col divide-y divide-(--outline)">
              {UPCOMING.slice(1).map((e, i) => (
                <Link
                  key={e.title}
                  href="/"
                  className="group flex items-start gap-5 py-5 first:pt-0 last:pb-0"
                >
                  <span className="text-display-4 text-(--on-bg-low) tabular-nums w-10 shrink-0">
                    {String(i + 2).padStart(2, "0")}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="tonal-static">{e.tag}</Badge>
                    </div>
                    <h3 className="text-heading-3 leading-tight group-hover:text-(--primary) transition-colors">
                      {e.title}
                    </h3>
                    <p className="text-body-5 text-(--on-bg-low) uppercase tracking-wider mt-2">
                      {e.date}
                    </p>
                  </div>
                  <div className="hidden sm:flex flex-col items-end shrink-0">
                    <span className="text-body-5 uppercase tracking-widest text-(--on-bg-low)">
                      Приз
                    </span>
                    <span className="text-heading-3 text-(--primary) tabular-nums">
                      {e.prize}
                    </span>
                  </div>
                  <ArrowUpRight className="size-5 text-(--on-bg-low) group-hover:text-(--primary) transition-colors mt-1 shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ============================================================
          CTA — logo watermark, not a generic box. The VershinyLogo
          repeats at low opacity behind the copy so the brand closes
          the page the way it opened it.
         ============================================================ */}
      <section className="pb-24">
        <Container variant="full-width">
          <div className="relative overflow-hidden rounded-3xl border border-(--outline) bg-(--card) p-8 md:p-14">
            {/* watermark */}
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
                Участие бесплатно, опыт не нужен, возраст от 16 лет. Мы поможем
                с ментором, событиями и первой стажировкой.
              </p>

              <div className="flex flex-wrap gap-3 mt-8">
                <Button size="large" variant="filled" shape="round" asChild>
                  <Link href="/">
                    Присоединиться
                    <ArrowRight />
                  </Link>
                </Button>
                <Button size="large" variant="outlined" shape="round" asChild>
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

              <p className="text-body-5 text-(--on-bg-low) mt-6">
                Telegram · VK · MAX
              </p>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}

/* ---------------------------------------------------------
   Featured upcoming event — big card, uses the mountain shape
   as a visual anchor instead of a stock illustration.
--------------------------------------------------------- */
function FeaturedUpcoming({
  event,
}: {
  event: { title: string; date: string; tag: string; prize: string };
}) {
  return (
    <Card className="relative overflow-hidden p-8 md:p-10 gap-6 flex flex-col justify-between min-h-[360px]">
      {/* decorative peak line */}
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
          <Mountains className="size-4 text-(--primary)" />
          <span className="text-body-5 uppercase tracking-widest text-(--on-bg-low)">
            Главное событие
          </span>
        </div>
        <Badge variant="tonal-static" className="w-fit mb-4">
          {event.tag}
        </Badge>
        <h3 className="text-display-3 leading-tight">{event.title}</h3>
        <p className="text-body-5 text-(--on-bg-low) uppercase tracking-wider mt-4">
          {event.date}
        </p>
      </div>

      <div className="relative flex items-end justify-between gap-4">
        <div>
          <div className="text-body-5 uppercase tracking-widest text-(--on-bg-low)">
            Призовой фонд
          </div>
          <div className="text-display-2 text-(--primary) tabular-nums leading-none mt-2">
            {event.prize}
          </div>
        </div>
        <Button variant="glass" size="icon-large" shape="round" asChild>
          <Link href="/" aria-label="Подробнее о событии">
            <ArrowRight />
          </Link>
        </Button>
      </div>
    </Card>
  );
}
