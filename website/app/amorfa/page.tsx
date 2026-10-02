import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TerminalStyledInline } from "@/components/layout/fancy/terminal-styled-inline";
import { AmorfaLogo } from "@/components/icons/logotypes/amorfa-logo";
import {
  ArrowUpRightIcon,
  ArrowRightIcon,
  CodeIcon,
  CubeIcon,
  GitBranchIcon,
  LightningIcon,
  RobotIcon,
  StackIcon,
  PackageIcon,
  TerminalWindowIcon,
} from "@phosphor-icons/react/dist/ssr";

export const metadata = {
  title: "Amorfa — AI-optimized fullstack framework · Unidoka",
  description:
    "Amorfa — open-source fullstack framework for building apps in hours. FastAPI + Next.js + PostgreSQL, ready to ship, AI-friendly.",
};

const GITHUB = "https://github.com/unidoka/amorfa";

const FEATURES = [
  {
    icon: LightningIcon,
    title: "Ship in hours",
    body: "Batteries-included scaffold with auth, DB, caching, proxy, and CI already wired. Clone, edit .env, run.",
  },
  {
    icon: RobotIcon,
    title: "AI-first structure",
    body: "Every file carries LLM-readable context. Repomix config, .agents/skills, and a documented file tree out of the box.",
  },
  {
    icon: StackIcon,
    title: "Fullstack, honestly",
    body: "FastAPI + SQLAlchemy 2.0 + Alembic on the backend. Next.js 16 App Router + Tailwind v4 on the frontend. One repo.",
  },
  {
    icon: PackageIcon,
    title: "Zero lock-in",
    body: "No SaaS dashboards required. Docker Compose, Traefik, Postgres, Valkey — all self-hostable on a single VPS.",
  },
  {
    icon: GitBranchIcon,
    title: "Multi-service ready",
    body: "The /services folder is a convention, not a constraint. Split into microservices when you actually need to.",
  },
  {
    icon: CodeIcon,
    title: "Documented defaults",
    body: "Comments explain why, not what. JWT rotation, OTP, rate limiting, and email flows come pre-wired.",
  },
];

const STACK = [
  "Python 3.12",
  "FastAPI",
  "SQLAlchemy 2.0",
  "Alembic",
  "PostgreSQL 15",
  "Valkey / Redis",
  "Next.js 16",
  "React 19",
  "Tailwind CSS v4",
  "TypeScript",
  "Docker",
  "Traefik",
];

const TREE = `/
├── backend/
│   ├── services/
│   │   └── main-service/          # FastAPI service
│   ├── env.example                # .env vars for the backend
│   ├── Dockerfile
│   └── docker-compose.yml
├── website/
│   ├── app/                       # Next.js App Router
│   ├── components/                # shadcn/ui + custom
│   ├── env.example
│   ├── Dockerfile
│   └── docker-compose.yml
├── .agents/skills/                # LLM context for the agent
├── env.example                    # shared .env vars
├── docker-compose.yml             # top-level compose
└── README.md`;

export default function AmorfaPage() {
  return (
    <main className="min-h-screen bg-(--bg) pb-24">
      {/* ─── HERO ───────────────────────────────────────────────── */}
      <section className="relative pt-20 md:pt-28 pb-16 md:pb-24 border-b border-(--outline) overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--on-bg-high) 1px, transparent 1px), linear-gradient(to bottom, var(--on-bg-high) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
            maskImage:
              "radial-gradient(ellipse 60% 70% at 30% 0%, black 40%, transparent 90%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 60% 70% at 30% 0%, black 40%, transparent 90%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 50% 60% at 15% 10%, var(--primary-glass), transparent 65%)",
          }}
        />
        <Container className="relative">
          <div className="max-w-[900px] animate-reveal">
            <div className="flex items-center gap-4 mb-8">
              <AmorfaLogo className="size-14 md:size-16" />
              <div>
                <p className="text-body-5 uppercase tracking-[0.32em] text-(--on-bg-low)">
                  Open source · Unidoka
                </p>
                <p className="text-body-4 text-(--on-bg-medium)">
                  github.com/unidoka/amorfa
                </p>
              </div>
            </div>
            <h1 className="text-display-2 md:text-display-0 text-(--on-bg-high) leading-[0.98] tracking-[-0.03em] mb-6">
              Amorfa.
              <br />
              <span className="text-(--primary)">
                Fullstack in hours, not weeks.
              </span>
            </h1>
            <p className="text-body-1 md:text-display-5 text-(--on-bg-medium) leading-relaxed max-w-[720px] mb-8">
              AI-optimized fullstack framework: FastAPI, Next.js, PostgreSQL,
              and Valkey — pre-wired, documented, and self-hostable. Clone the
              repo and start building the thing you actually wanted to build.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="large" shape="round" asChild>
                <Link href={GITHUB} target="_blank" rel="noopener noreferrer">
                  <GitBranchIcon className="size-4" />
                  Открыть на GitHub
                  <ArrowUpRightIcon className="size-4" />
                </Link>
              </Button>
              <Button size="large" variant="outlined" shape="round" asChild>
                <Link href="#quickstart">
                  Быстрый старт
                  <ArrowRightIcon className="size-4" />
                </Link>
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap gap-2">
              <Badge variant="tonal-card-static" size="chip-medium">
                MIT License
              </Badge>
              <Badge variant="tonal-card-static" size="chip-medium">
                Python 3.12 · Node 22
              </Badge>
              <Badge variant="tonal-card-static" size="chip-medium">
                Docker Compose
              </Badge>
              <Badge variant="tonal-card-static" size="chip-medium">
                AI-friendly
              </Badge>
            </div>
          </div>
        </Container>
      </section>

      {/* ─── FEATURES ───────────────────────────────────────────── */}
      <section className="py-16 md:py-24">
        <Container>
          <div className="mb-12">
            <p className="text-body-5 uppercase tracking-[0.32em] text-(--primary) mb-3">
              Что внутри
            </p>
            <h2 className="text-display-3 md:text-display-2 text-(--on-bg-high) tracking-tight max-w-[700px]">
              Всё, что нужно для продакшена — и ничего лишнего.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <Card
                  key={f.title}
                  className="rounded-3xl border border-(--outline) bg-(--card) ring-0 p-7"
                >
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-(--primary-card) text-(--primary) mb-5">
                    <Icon className="size-5" weight="bold" />
                  </div>
                  <h3 className="text-heading-3 text-(--on-bg-high) mb-2">
                    {f.title}
                  </h3>
                  <p className="text-body-3 text-(--on-bg-medium) leading-relaxed">
                    {f.body}
                  </p>
                </Card>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ─── STRUCTURE ──────────────────────────────────────────── */}
      <section className="py-16 md:py-24 border-y border-(--outline) bg-(--card)/40">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-10 lg:gap-16 items-start">
            <div>
              <p className="text-body-5 uppercase tracking-[0.32em] text-(--primary) mb-3">
                Структура
              </p>
              <h2 className="text-display-4 md:text-display-3 text-(--on-bg-high) tracking-tight mb-5">
                Один репозиторий — два сервиса.
              </h2>
              <p className="text-body-3 text-(--on-bg-medium) leading-relaxed mb-6">
                Монорепо по умолчанию: бэкенд и фронтенд рядом, но
                изолированы. Разделение на микросервисы — вопрос одного
                docker-compose, а не переписывания.
              </p>
              <p className="text-body-3 text-(--on-bg-medium) leading-relaxed">
                Каждый файл несёт контекст для LLM-агента: комментарии,
                структура, .agents/skills. Repomix-конфиг собирает весь проект
                в один читаемый документ — можно скармливать модели целиком.
              </p>
            </div>
            <div>
              <TerminalStyledInline command="git clone https://github.com/unidoka/amorfa" />
              <pre className="mt-4 rounded-2xl border border-(--outline) bg-(--bg) p-5 text-[12px] leading-relaxed font-mono text-(--on-bg-medium) overflow-x-auto">
                <code>{TREE}</code>
              </pre>
            </div>
          </div>
        </Container>
      </section>

      {/* ─── STACK ──────────────────────────────────────────────── */}
      <section className="py-16 md:py-20">
        <Container>
          <p className="text-body-5 uppercase tracking-[0.32em] text-(--primary) mb-3">
            Стек
          </p>
          <h2 className="text-display-4 md:text-display-3 text-(--on-bg-high) tracking-tight mb-8">
            Современный, скучный, надёжный.
          </h2>
          <div className="flex flex-wrap gap-2">
            {STACK.map((s) => (
              <Badge
                key={s}
                variant="tonal-card-static"
                size="chip-medium"
                className="font-mono"
              >
                {s}
              </Badge>
            ))}
          </div>
        </Container>
      </section>

      {/* ─── QUICKSTART ─────────────────────────────────────────── */}
      <section id="quickstart" className="py-16 md:py-24 border-t border-(--outline)">
        <Container>
          <div className="max-w-[800px]">
            <p className="text-body-5 uppercase tracking-[0.32em] text-(--primary) mb-3">
              Быстрый старт
            </p>
            <h2 className="text-display-3 md:text-display-2 text-(--on-bg-high) tracking-tight mb-8">
              Три команды до работающего приложения.
            </h2>
            <div className="space-y-4">
              <Step n="01" title="Клонировать и настроить">
                <TerminalStyledInline command="git clone https://github.com/unidoka/amorfa && cd amorfa && cp .env.example .env" />
              </Step>
              <Step n="02" title="Поднять контейнеры">
                <TerminalStyledInline command="docker compose up -d --build" />
              </Step>
              <Step n="03" title="Применить миграции">
                <TerminalStyledInline command="docker exec -it main-service alembic upgrade head" />
              </Step>
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button size="large" shape="round" asChild>
                <Link href={GITHUB} target="_blank" rel="noopener noreferrer">
                  <GitBranchIcon className="size-4" />
                  Все инструкции на GitHub
                  <ArrowUpRightIcon className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* ─── CTA ────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <Container>
          <div className="max-w-[860px] mx-auto relative rounded-5xl border border-(--outline) bg-(--card) p-8 md:p-14 overflow-hidden text-center">
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 60% 90% at 50% 0%, var(--primary-glass), transparent 70%)",
              }}
            />
            <div className="relative">
              <AmorfaLogo className="size-14 mx-auto mb-6" />
              <h2 className="text-display-3 md:text-display-2 text-(--on-bg-high) tracking-tight mb-4">
                Открытый исходный код.
                <br />
                Ваш ход.
              </h2>
              <p className="text-body-2 text-(--on-bg-medium) leading-relaxed mb-8 max-w-lg mx-auto">
                Форкайте, дописывайте, присылайте PR. Amorfa живёт, пока её
                используют.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button size="large" shape="round" asChild>
                  <Link href={GITHUB} target="_blank" rel="noopener noreferrer">
                    <GitBranchIcon className="size-4" />
                    github.com/unidoka/amorfa
                    <ArrowUpRightIcon className="size-4" />
                  </Link>
                </Button>
                <Button size="large" variant="outlined" shape="round" asChild>
                  <Link href="/">
                    ← На главную
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[52px_1fr] gap-4 items-start">
      <span className="font-mono text-2xl font-bold text-(--primary) leading-none pt-1 tabular-nums">
        {n}
      </span>
      <div>
        <h3 className="text-heading-4 text-(--on-bg-high) mb-2">{title}</h3>
        {children}
      </div>
    </div>
  );
}
