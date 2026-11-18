"use client";

import { Container } from "@/components/ui/container";
import { useLanguage } from "@/providers/language-provider";

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
] as const;

export function StackSection() {
  const { t } = useLanguage();

  return (
    <section className="border-b border-(--outline) py-20 md:py-28">
      <Container variant="full-width">
        <h2 className="mb-14 text-display-3 leading-[1.05] md:text-display-2">
          {t("amorfa.stack_title")}
        </h2>

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-(--outline) bg-(--outline) sm:grid-cols-2 lg:grid-cols-4">
          {STACK.map((s) => (
            <div
              key={s}
              className="bg-(--bg) px-6 py-5 font-mono text-body-3 text-(--on-bg-medium) transition-colors duration-300 hover:bg-(--card) hover:text-(--on-bg-high)"
            >
              {s}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
