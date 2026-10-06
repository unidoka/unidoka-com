"use client";

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
} from "@phosphor-icons/react";
import { useLanguage } from "@/providers/language-provider";

const GITHUB = "https://github.com/unidoka/amorfa";

/* Icon + i18n key pairs — resolved with t() at render, so flipping the
   language switcher re-renders the copy without a full page reload. */
const FEATURES = [
  { icon: LightningIcon, titleKey: "amorfa.feature_1_title", bodyKey: "amorfa.feature_1_body" },
  { icon: RobotIcon, titleKey: "amorfa.feature_2_title", bodyKey: "amorfa.feature_2_body" },
  { icon: StackIcon, titleKey: "amorfa.feature_3_title", bodyKey: "amorfa.feature_3_body" },
  { icon: PackageIcon, titleKey: "amorfa.feature_4_title", bodyKey: "amorfa.feature_4_body" },
  { icon: GitBranchIcon, titleKey: "amorfa.feature_5_title", bodyKey: "amorfa.feature_5_body" },
  { icon: CodeIcon, titleKey: "amorfa.feature_6_title", bodyKey: "amorfa.feature_6_body" },
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

/* The file tree carries inline comments, so it is not translatable via
   t() — it ships as two full strings and the component picks one. */
const TREE_EN = `/
├── backend/
│   ├── services/
│   │   └── main-service/          # FastAPI service
│   ├── env.example                # backend .env vars
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

const TREE_RU = `/
├── backend/
│   ├── services/
│   │   └── main-service/          # FastAPI-сервис
│   ├── env.example                # .env-переменные бэкенда
│   ├── Dockerfile
│   └── docker-compose.yml
├── website/
│   ├── app/                       # Next.js App Router
│   ├── components/                # shadcn/ui + кастомные
│   ├── env.example
│   ├── Dockerfile
│   └── docker-compose.yml
├── .agents/skills/                # LLM-контекст для агента
├── env.example                    # общие .env-переменные
├── docker-compose.yml             # топовый compose
└── README.md`;

export default function AmorfaPage() {
  const { t, lang } = useLanguage();
  const TREE = lang === "ru" ? TREE_RU : TREE_EN;

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
                  {t("amorfa.eyebrow")}
                </p>
                <p className="text-body-4 text-(--on-bg-medium)">
                  github.com/unidoka/amorfa
                </p>
              </div>
            </div>
            <h1 className="text-display-2 md:text-display-0 text-(--on-bg-high) leading-[0.98] tracking-[-0.03em] mb-6">
              {t("amorfa.title_1")}
              <br />
              <span className="text-(--primary)">
                {t("amorfa.title_2")}
              </span>
            </h1>
            <p className="text-body-1 md:text-display-5 text-(--on-bg-medium) leading-relaxed max-w-[720px] mb-8">
              {t("amorfa.description")}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="large" shape="round" asChild>
                <Link href={GITHUB} target="_blank" rel="noopener noreferrer">
                  <GitBranchIcon className="size-4" />
                  {t("amorfa.cta_github")}
                  <ArrowUpRightIcon className="size-4" />
                </Link>
              </Button>
              <Button size="large" variant="outlined" shape="round" asChild>
                <Link href="#quickstart">
                  {t("amorfa.cta_quickstart")}
                  <ArrowRightIcon className="size-4" />
                </Link>
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap gap-2">
              <Badge variant="tonal-card-static" size="chip-medium">
                Apache 2.0 License
              </Badge>
              <Badge variant="tonal-card-static" size="chip-medium">
                Amorfa UI
              </Badge>
              <Badge variant="tonal-card-static" size="chip-medium">
                Docker Compose
              </Badge>
              <Badge variant="tonal-card-static" size="chip-medium">
                AI-optimized
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
              {t("amorfa.features_eyebrow")}
            </p>
            <h2 className="text-display-3 md:text-display-2 text-(--on-bg-high) tracking-tight max-w-[700px]">
              {t("amorfa.features_title")}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <Card
                  key={f.titleKey}
                  className="rounded-3xl border border-(--outline) bg-(--card) ring-0 p-7"
                >
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-(--primary-card) text-(--primary) mb-5">
                    <Icon className="size-5" weight="bold" />
                  </div>
                  <h3 className="text-heading-3 text-(--on-bg-high) mb-2">
                    {t(f.titleKey)}
                  </h3>
                  <p className="text-body-3 text-(--on-bg-medium) leading-relaxed">
                    {t(f.bodyKey)}
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
                {t("amorfa.structure_eyebrow")}
              </p>
              <h2 className="text-display-4 md:text-display-3 text-(--on-bg-high) tracking-tight mb-5">
                {t("amorfa.structure_title")}
              </h2>
              <p className="text-body-3 text-(--on-bg-medium) leading-relaxed mb-6">
                {t("amorfa.structure_body_1")}
              </p>
              <p className="text-body-3 text-(--on-bg-medium) leading-relaxed">
                {t("amorfa.structure_body_2")}
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
            {t("amorfa.stack_eyebrow")}
          </p>
          <h2 className="text-display-4 md:text-display-3 text-(--on-bg-high) tracking-tight mb-8">
            {t("amorfa.stack_title")}
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
              {t("amorfa.quickstart_eyebrow")}
            </p>
            <h2 className="text-display-3 md:text-display-2 text-(--on-bg-high) tracking-tight mb-8">
              {t("amorfa.quickstart_title")}
            </h2>
            <div className="space-y-4">
              <Step n="01" title={t("amorfa.step_1_title")}>
                <TerminalStyledInline command="git clone https://github.com/unidoka/amorfa && cd amorfa && cp .env.example .env" />
              </Step>
              <Step n="02" title={t("amorfa.step_2_title")}>
                <TerminalStyledInline command="docker compose up -d --build" />
              </Step>
              <Step n="03" title={t("amorfa.step_3_title")}>
                <TerminalStyledInline command="docker exec -it main-service alembic upgrade head" />
              </Step>
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button size="large" shape="round" asChild>
                <Link href={GITHUB} target="_blank" rel="noopener noreferrer">
                  <GitBranchIcon className="size-4" />
                  {t("amorfa.quickstart_cta")}
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
                {t("amorfa.cta_title_1")}
                <br />
                {t("amorfa.cta_title_2")}
              </h2>
              <p className="text-body-2 text-(--on-bg-medium) leading-relaxed mb-8 max-w-lg mx-auto">
                {t("amorfa.cta_body")}
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
                  <Link href="/">{t("amorfa.cta_home")}</Link>
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
    <div className="grid grid-cols-[52px_minmax(0,1fr)] gap-4 items-start">
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
