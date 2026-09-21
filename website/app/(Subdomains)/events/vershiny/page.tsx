"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Cpu,
  Lightbulb,
  ArrowRight,
  ArrowUpRight,
  CalendarBlank,
} from "@phosphor-icons/react";

// We are already on events.<domain>, so internal links are relative.
// `/` on this subdomain = the events list (proxy rewrites to /events internally).
const eventsIndex = "/";

const PILLARS = [
  {
    icon: Users,
    title: "Соединяем таланты",
    description:
      "Молодые специалисты в IT, дизайне и бизнесе. Конференции, форумы, стажировки и менторы из Rovno.dev и Юнидоки.",
    href: eventsIndex,
    cta: "Наши события",
  },
  {
    icon: Cpu,
    title: "AI на слабом железе",
    description:
      "Делаем искусственный интеллект, который работает на слабых устройствах. Без облаков и дорогих серверов.",
    href: eventsIndex,
    cta: "Смотреть календарь",
  },
  {
    icon: Lightbulb,
    title: "Решения, которые решают",
    description:
      "Разрабатываем продукты и сервисы, которые закрывают реальные задачи бизнеса и людей.",
    href: eventsIndex,
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
  { title: "Cortex Challenge 2026", date: "Сентябрь — Ноябрь 2026", tag: "BI · Аналитика", prize: "1 000 000 ₽" },
  { title: "RISC-V Конкурс 2026", date: "Август — Декабрь 2026", tag: "Hardware · MIK32", prize: "до 49 999 ₽" },
  { title: "Хакатон Московского Транспорта", date: "25 сентября — 3 октября 2026", tag: "Геймификация · ВСМ", prize: "500 000 ₽" },
];

export default function VershinyPage() {
  const pathname = usePathname();
  // On events.<domain> the URL is `/vershiny`; keep the pathname var around
  // so future anchor links (e.g. scroll targets) can be relative to it.
  void pathname;

  return (
    <div className="min-h-screen">
      {/* HERO */}
      <section className="border-b border-(--outline)">
        <Container>
          <div className="flex flex-col items-start text-left py-20 md:py-28 max-w-4xl">
            <Badge variant="glass-static">Unidoka · Better together</Badge>
            <h1 className="text-display-2 md:text-display-1 mt-6 leading-[1.05]">
              Соединяем таланты, AI
              <br className="hidden md:block" /> и решения, которые решают
            </h1>
            <p className="text-body-2 text-(--on-bg-medium) mt-6 max-w-2xl">
              Unidoka — экосистема, в которой молодые специалисты растут, а
              искусственный интеллект работает там, где другие сдаются. Вместе
              мы делаем больше.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-10">
              <Button variant="filled" size="large" asChild>
                <Link href={eventsIndex}>
                  Смотреть события
                  <ArrowRight />
                </Link>
              </Button>
              <Button variant="outlined" size="large" asChild>
                <Link href={eventsIndex}>
                  <CalendarBlank />
                  Календарь событий
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* PILLARS */}
      <section className="py-20 md:py-24">
        <Container>
          <div className="max-w-2xl mb-10">
            <p className="text-body-5 uppercase tracking-widest text-(--primary) mb-3">Что мы делаем</p>
            <h2 className="text-display-3">Три опоры Unidoka</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PILLARS.map((p) => {
              const Icon = p.icon;
              return (
                <Card key={p.title} className="p-6 gap-4 flex flex-col">
                  <Icon className="size-8 text-(--primary)" />
                  <h3 className="text-heading-2 leading-tight">{p.title}</h3>
                  <p className="text-body-4 text-(--on-bg-medium) flex-1">{p.description}</p>
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

      {/* HIGHLIGHTS */}
      <section className="py-20 md:py-24 bg-(--card) border-y border-(--outline)">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {HIGHLIGHTS.map((h) => (
              <div key={h.label} className="flex flex-col gap-1">
                <p className="text-display-3 text-(--primary)">{h.value}</p>
                <p className="text-heading-5">{h.label}</p>
                <p className="text-body-5 text-(--on-bg-medium)">{h.note}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* UPCOMING */}
      <section className="py-20 md:py-24">
        <Container>
          <div className="flex items-end justify-between mb-10 gap-6 flex-wrap">
            <div className="max-w-2xl">
              <p className="text-body-5 uppercase tracking-widest text-(--primary) mb-3">Что дальше</p>
              <h2 className="text-display-3">Ближайшие соревнования</h2>
            </div>
            <Button variant="outlined" size="medium" asChild>
              <Link href={eventsIndex}>
                Все события
                <ArrowRight />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {UPCOMING.map((e) => (
              <Card key={e.title} className="p-5 gap-4">
                <Badge variant="tonal-static" className="w-fit">{e.tag}</Badge>
                <h3 className="text-heading-3 leading-tight">{e.title}</h3>
                <p className="text-body-5 text-(--on-bg-low) uppercase tracking-wider">{e.date}</p>
                <p className="text-display-4 text-(--primary) mt-auto">{e.prize}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="pb-24">
        <Container>
          <Card className="p-8 md:p-12 gap-6 items-start bg-(--primary-glass) ring-(--primary)/30">
            <Badge variant="glass-static">Better together</Badge>
            <h2 className="text-display-3 max-w-2xl">Готов сделать шаг к своей вершине?</h2>
            <p className="text-body-3 text-(--on-bg-medium) max-w-2xl">
              Участие бесплатно, опыт не нужен, возраст от 16 лет. Мы поможем с
              ментором, событиями и первой стажировкой.
            </p>
            <div className="flex flex-wrap gap-3 mt-2">
              <Button size="large" variant="filled" asChild>
                <Link href={eventsIndex}>
                  Присоединиться
                  <ArrowRight />
                </Link>
              </Button>
              <Button size="large" variant="outlined" asChild>
                <a href="https://events.unidoka.com" target="_blank" rel="noopener noreferrer">
                  events.unidoka.com
                  <ArrowUpRight />
                </a>
              </Button>
            </div>
            <p className="text-body-5 text-(--on-bg-low)">Telegram · VK · MAX</p>
          </Card>
        </Container>
      </section>
    </div>
  );
}
