"use client";

import { Container } from "@/components/ui/container";
import { TerminalStyledInline } from "@/components/layout/fancy/terminal-styled-inline";
import { useLanguage } from "@/providers/language-provider";

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
├── docker-compose.yml             # docker compose
└── README.md`;

export function StructureSection() {
  const { t, lang } = useLanguage();
  const tree = lang === "ru" ? TREE_RU : TREE_EN;

  return (
    <section className="border-b border-(--outline) bg-(--card) py-20 md:py-28">
      <Container variant="full-width">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          <div>
            <h2 className="mb-6 text-display-3 leading-[1.05] md:text-display-2">
              {t("amorfa.structure_title")}
            </h2>
            <p className="mb-6 max-w-[560px] text-body-2 leading-relaxed text-(--on-bg-medium)">
              {t("amorfa.structure_body_1")}
            </p>
            <p className="max-w-[560px] text-body-2 leading-relaxed text-(--on-bg-medium)">
              {t("amorfa.structure_body_2")}
            </p>
          </div>

          <div className="min-w-0">
            <TerminalStyledInline command="git clone https://github.com/unidoka/amorfa" />
            <pre className="mt-4 overflow-x-auto rounded-2xl border border-(--outline) bg-(--bg) p-5 font-mono text-[12px] leading-relaxed text-(--on-bg-medium) scrollbar-terminal">
              <code>{tree}</code>
            </pre>
          </div>
        </div>
      </Container>
    </section>
  );
}
